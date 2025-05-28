<?php

namespace App\Service;

use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class ItemService
{
    private const MAX_RESERVATIONS_PER_USER = 5;

    private EntityManagerInterface $em;

    public function __construct(private EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

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
        return $count >= self::MAX_RESERVATIONS_PER_USER;
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


    public function reserve (User $user, Item $item): void
    {
        // Check User
        if ($user === null){ 
           throw new UnauthorizedHttpException( "Full authentication is required to access this resource."); 
        }

        // Check User != Donor
        if($item->getDonor() === $user){
            throw new UnauthorizedHttpException("You cannot reserve your own item");
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
}