<?php

namespace App\Service;

use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ItemService
{
    private const MAX_RESERVATIONS_PER_USER = 5;
    private const MAX_POSTS_PER_USER_PER_DAY = 10;

    private EntityManagerInterface $em;
    private UrlGeneratorInterface $urlGen;

    public function __construct(
        EntityManagerInterface $entityManager,
        UrlGeneratorInterface $urlGenerator
        )
    {
        $this->em = $entityManager;
        $this->urlGen = $urlGenerator;
    }



    // Reservation limit


    /**
     * The maximum amount of items a user can reserve at the same time.
     * @return int
     */
    public function getMaxReservationsPerUser(): int
    {
        return self::MAX_RESERVATIONS_PER_USER;
    }

    /**
     * Indicates if the user has reached the maxium number of items they can reserve at the same time.
     * @param \App\Entity\User $user
     * @return bool 
     */
    public function isReservationLimitExceeded(User $user): bool
    {
        $count = $this->em->getRepository(Item::class)->count([
            'receiver' => $user,
            'status' => ItemStatusEnum::RESERVED
        ]);
        return $count >= self::getMaxReservationsPerUser();
    }

    /**
     * Throws an error if the user has reserved too many items.
     * 
     * @param \App\Entity\User $user
     * @throws \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
     * @return void
     */
    public function checkReservationLimit(User $user): void
    {
        if($this->isReservationLimitExceeded($user)){
            throw new AccessDeniedHttpException("You have already " . $this->getMaxReservationsPerUser() . " items in your reservation list.");
        }
    }



    // Post limit


    /**
     * The maximum amount of items a user can create during the same day.
     * @return int
     */
    public function getMaxPostsPerUserPerDay(): int
    {
        return self::MAX_POSTS_PER_USER_PER_DAY;
    }

    /**
     * Indicates if the user has reached the maxium number of items they can create today.
     * @param \App\Entity\User $user
     * @return bool 
     */
    public function isPostLimitExceededToday(User $user): bool
    {
        $count = $this->em
            ->getRepository(Item::class)
            ->countItemsCreatedTodayForUser($user)
        ;
        return $count >= self::getMaxPostsPerUserPerDay();
    }

    /**
     * Throws an error if the user has created too many items today.
     * 
     * @param \App\Entity\User $user
     * @throws \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
     * @return void
     */
    public function checkPostLimit(User $user): void
    {
        if($this->isPostLimitExceededToday($user)){
            throw new AccessDeniedHttpException("You have already posted " . $this->getMaxPostsPerUserPerDay() . " items today. Wait for tomorrow to post more items!");
        }
    }
    



    // Reserve, cancel, confirm


    /**
     * Set the item as reserved for the user.
     * @param \App\Entity\User $user
     * @param \App\Entity\Item $item
     * @throws \Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException User needs to be authentified
     * @throws \Symfony\Component\HttpKernel\Exception\ConflictHttpException The item has to be available and not donated by the user
     * @return void
     */
    public function reserve (User $user, Item $item): void
    {
        // Check User
        if ($user === null){ 
           throw new UnauthorizedHttpException( "Full authentication is required to access this resource."); 
        }

        // Check User != Donor
        if($item->getDonor() === $user){
            throw new ConflictHttpException("You cannot reserve your own item");
        }

        // Check Item status
        if($item->getStatus() === ItemStatusEnum::RESERVED){
            throw new ConflictHttpException("This item is already reserved");
        }
        if($item->getStatus() === ItemStatusEnum::OVER){
            throw new ConflictHttpException("This deal is already over");
        }

        // Check item reservation limit
        $this->checkReservationLimit($user);

        // Change item status
        $item->setStatus(ItemStatusEnum::RESERVED);
        $item->setReceiver($user);

        // Create a new chat  (TODO, return the chat id!!)
        // ... TODO ...

        // Save and return
        $this->em->persist($item);
        $this->em->flush();
    }


    /**
     * Cancel the reservation of the item
     * @param \App\Entity\User $user
     * @param \App\Entity\Item $item
     * @throws \Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException User needs to be authentified
     * @throws \Symfony\Component\Finder\Exception\AccessDeniedException User needs to be the receiver or donor of the item
     * @throws \Symfony\Component\HttpKernel\Exception\ConflictHttpException The item has to be reserved
     * @return void
     */
    public function cancel (User $user, Item $item): void
    {
        // Check User
        if ($user === null){ 
           throw new UnauthorizedHttpException( "Full authentication is required to access this resource."); 
        }

        // Check User == Donor | Receiver
        if($item->getDonor() !== $user && $item->getReceiver() !== $user){
            throw new AccessDeniedException("You do not own this item.");
        }

        // Check Item status
        if($item->getStatus() !== ItemStatusEnum::RESERVED){
            throw new ConflictHttpException("Item is not reserved.");
        }

        // Set status
        $item->setStatus(ItemStatusEnum::OPEN);
        $item->setReceiver(null);

        // Close Chat
        // ... TODO ...

        // Save
        $this->em->persist($item);
        $this->em->flush();
    }


    /**
     * Confirm that the user has received the item.
     * 
     * @param \App\Entity\User $user
     * @param \App\Entity\Item $item
     * @throws \Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException User needs to be authentified
     * @throws \Symfony\Component\Finder\Exception\AccessDeniedException User needs to be the receiver of the item
     * @throws \Symfony\Component\HttpKernel\Exception\ConflictHttpException The item has to be reserved
     * @return void
     */
    public function confirm (User $user, Item $item): void
    {
        // Check User
        if ($user === null){ 
           throw new UnauthorizedHttpException( "Full authentication is required to access this resource."); 
        }

        // Check User == Receiver
        if($item->getReceiver() !== $user){
            throw new AccessDeniedException("You are not the receiver of this item.");
        }

        // Check Item status
        if($item->getStatus() !== ItemStatusEnum::RESERVED){
            throw new ConflictHttpException("Item is not reserved.");
        }

        // Set status
        $item->setStatus(ItemStatusEnum::OVER);

        // Close Chat
        // ... TODO ...

        // Save
        $this->em->persist($item);
        $this->em->flush();
    }


    public function getItemsOnCriteria(array $criteria): array
    {
        // Get items
        $items = $this->em->getRepository(Item::class)->findBy($criteria);
        // Images
        foreach ($items as $item) {
            $item
                ->setImageUrl($this->urlGen->generate('api_items_image', ['id' => $item->getId()]))
            ;
        };
        // Return
        return $items;
    }
}