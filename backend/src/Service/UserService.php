<?php

namespace App\Service;

use App\Entity\Community;
use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class UserService
{

    private const RESTRICTION_BAN_COUNT = 4;
    private const RESTRICTION_SIMULTANEOUS_BAN_COUNT = 2;

    private EntityManagerInterface $em;
    private UrlGeneratorInterface $urlGen;

    public function __construct(
        EntityManagerInterface $entityManager, 
        UrlGeneratorInterface $router,
        )
    {
        $this->em = $entityManager;
        $this->urlGen = $router;
    }

    /**
     * Generate the url to access the user's avatar
     * @param \App\Entity\User $user
     * @return void
     */
    public function generateAvatarUrl(User $user)
    {
        if($user->getAvatar() === null){
            $user
                ->setAvatarUrl($this->urlGen->generate('api_default_avatar'))
            ;
        }else{
            $user
                ->setAvatarUrl($this->urlGen->generate('api_user_avatar', ['id' => $user->getId()]))
            ;
        }
    }

    public function generateInfo(User $user)
    {
        // Get repository
        $itemRepository = $this->em->getRepository(Item::class);
        $memberRepository = $this->em->getRepository(Member::class);

        // receipts
        $itemsReceived = $itemRepository->count([
            "receiver"=> $user,
            "status"=> ItemStatusEnum::OVER
        ]);

        // given
        $itemsGiven = $itemRepository->count([
            "donor"=> $user,
            "status"=> ItemStatusEnum::OVER
        ]);

        // Community count
        $communityCount = $memberRepository->count(["user"=>$user]);

        // rating
        // TODO

        // Set
        $user
            ->setCommunityCount($communityCount)
            ->setItemsGivenCount($itemsGiven)
            ->setItemsReceivedCount($itemsReceived)
            ->setRating(0.0)
        ;
    }

    /**
     * Will ban the user from the website if they go beyond the limits.
     * @param \App\Entity\User $user
     * @return void
     */
    public function tryRestrictUser(User $user)
    {
        // Get repository
        $memberRepository = $this->em->getRepository(Member::class);

        // Current bans
        $currentBans = $memberRepository->count([
            "user" => $user,
            "isBanned" => true,
        ]);

        // Ban count
        $banCount = $memberRepository->sumBanCountForUser($user);

        // Check
        if(
            $currentBans >= self::RESTRICTION_SIMULTANEOUS_BAN_COUNT 
            ||
            $banCount >= self::RESTRICTION_BAN_COUNT
        ){
            $user->setIsRestricted(true); // Restrict
        }else{
            $user->setIsRestricted( false); // Unrestrict
        }

        // Save
        $this->em->persist($user);
        $this->em->flush();
    }
}