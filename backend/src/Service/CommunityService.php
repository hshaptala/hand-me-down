<?php

namespace App\Service;

use App\Entity\Community;
use App\Entity\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class CommunityService
{
    private const MAX_COMMUNITIES_PER_USER = 5;

    private EntityManagerInterface $em;

    public function __construct(private EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function getMaxCommunitiesPerUser(): int
    {
        return self::MAX_COMMUNITIES_PER_USER;
    }

    public function isJoinLimitExceeded(User $user): bool
    {
        $count = $this->em->getRepository(Member::class)->count([
            'user' => $user
        ]);
        return $count >= self::MAX_COMMUNITIES_PER_USER;
    }

    public function join (User $user, Community $community, ?string $password): void
    {

    }

    public function leave (User $user, Community $community): void
    {
        
    }
}