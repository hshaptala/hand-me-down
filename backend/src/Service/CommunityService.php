<?php

namespace App\Service;

use App\Entity\Community;
use App\Entity\Enum\VisibilityEnum;
use App\Entity\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;

class CommunityService
{
    private const MAX_COMMUNITIES_PER_USER = 5;

    private EntityManagerInterface $em;
    private PasswordHasherFactoryInterface $phf;

    public function __construct(private EntityManagerInterface $entityManager, PasswordHasherFactoryInterface $hasherFactory,)
    {
        $this->em = $entityManager;
        $this->phf = $hasherFactory;
    }

    /**
     * The maximum amount of communities a user can join.
     * @return int
     */
    public function getMaxCommunitiesPerUser(): int
    {
        return self::MAX_COMMUNITIES_PER_USER;
    }

    /**
     * Indicates if the user has reached the maxium number of communities joined.
     * @param \App\Entity\User $user
     * @return bool 
     */
    public function isJoinLimitExceeded(User $user): bool
    {
        $count = $this->em->getRepository(Member::class)->count([
            'user' => $user
        ]);
        return $count >= self::MAX_COMMUNITIES_PER_USER;
    }

    /**
     * Throws an error if the user has joined too many communities.
     * 
     * @param \App\Entity\User $user
     * @throws \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
     * @return void
     */
    public function checkJoinLimit(User $user): void
    {
        if($this->isJoinLimitExceeded($user)){
            throw new AccessDeniedHttpException("You have already joined the limit of " . $this->getMaxCommunitiesPerUser() . " communities.");
        }
    }

    /**
     * Makes the user join the community if: 
     * - they didn't already join it
     * - they do not exceed the maximum amount of communities per user
     * - they used the right password
     * 
     * @param \App\Entity\User $user
     * @param \App\Entity\Community $community
     * @param mixed $password
     * @throws \Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException
     * @return void
     */
    public function join (User $user, Community $community, ?string $password): void
    {
        // Check already joined
        $memberRepo = $this->em->getRepository(Member::class);
        $member = $memberRepo->findOneBy([
            'user' => $user,
            'community' => $community
        ]);
        if ($member !== null) {
            throw new ConflictHttpException('Already joined this community');
        }

        // Check community join limit
        $this->checkJoinLimit($user);

        // Get password hasher
        $passwordHasher = $this->phf->getPasswordHasher(Community::class);

        // Check visibility + password
        if($community->getVisibility() === VisibilityEnum::PRIVATE && 
           $community->getPassword() !== null &&
           (
              $password === null ||
             !$passwordHasher->verify($community->getPassword(), $password)
           )
          ){
            throw new UnprocessableEntityHttpException('Invalid password');
        }

        // Join
        $member = new Member();
        $member
            ->setUser($user)
            ->setCommunity($community)
        ;

        $this->em->persist($member);
        $this->em ->flush();
    }

    public function leave (User $user, Community $community): void
    {
        // Get member
        $memberRepo = $this->em->getRepository(Member::class);
        $member = $memberRepo->findOneBy([
            'user' => $user,
            'community' => $community,
            'isBanned' => false // If they are banned, they cannot "leave". It just means the can't join more communities. 
        ]);

        // Make sure user is in the community
        if ($member === null) {
            throw new ConflictHttpException('Not in this community');
        }

        // Make sure user is not the owner of the community
        if ($user === $community->getOwner()) {
            throw new ConflictHttpException('You can not leave a community you own');
        }

        // Save
        $this->em->remove($member);
        $this->em->flush();
    }
}