<?php

namespace App\Security;

use App\Entity\User;
use App\Entity\Community;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\Member;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CommunityVoter extends Voter
{
    public const MANAGE_OWNER = 'COMMUNITY_MANAGE_OWNER';
    public const DELETE = 'COMMUNITY_DELETE';
    public const MANAGE_ADMINS = 'COMMUNITY_MANAGE_ADMINS';
    public const MANAGE_ROLES = 'COMMUNITY_MANAGE_ROLES';
    public const EDIT = 'COMMUNITY_EDIT';
    public const MODERATE = 'COMMUNITY_MODERATE';
    public const VIEW = 'COMMUNITY_VIEW';

    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    protected function supports(string $attribute, $subject): bool
    {
        return in_array($attribute, [self::MANAGE_OWNER, self::DELETE, self::MANAGE_ADMINS, self::MANAGE_ROLES, self::EDIT, self::MODERATE, self::VIEW])
            && $subject instanceof Community;
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        /** @var User $user */
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Community $community */
        $community = $subject;

        $memberRepo = $this->em->getRepository(Member::class);
        $member = $memberRepo->findOneBy([
            'user' => $user,
            'community' => $community
        ]);

        if (!$member) {
            return false; // user is not in this community
        }

        switch ($attribute) {
            case self::VIEW:
                return in_array($member->getRole(), [CommunityRoleEnum::MEMBER, CommunityRoleEnum::MODERATOR, CommunityRoleEnum::ADMIN]);
            case self::MODERATE:
                return in_array($member->getRole(), [CommunityRoleEnum::MODERATOR, CommunityRoleEnum::ADMIN]);
            case self::EDIT:
                return $member->getRole() === CommunityRoleEnum::ADMIN;
            case self::MANAGE_ROLES:
                return $member->getRole() === CommunityRoleEnum::ADMIN;
            case self::MANAGE_ADMINS:
                return $user === $community->getOwner();
            case self::DELETE:
                return $user === $community->getOwner();
            case self::MANAGE_OWNER:
                return $user === $community->getOwner();
        }

        return false;
    }
}
