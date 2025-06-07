<?php

namespace App\Repository;

use App\Entity\Community;
use App\Entity\Member;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Member>
 */
class MemberRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Member::class);
    }

    public function sumBanCountForUser(User $user): int
    {
        $result = $this->createQueryBuilder("m")
            ->select('SUM(m.banCount) AS banCount')
            ->andWhere('m.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult()
        ;        return $result !== null && $result["banCount"] !== null ? $result["banCount"] : 0 ;
    }

    public function findByExceptRestricted(Community $community, bool $isBanned): array
    {
        return $this->createQueryBuilder("m")
            ->join(User::class, "u", Join::WITH, "m.user = u")
            ->andWhere("u.isRestricted = false")
            ->andWhere("m.isBanned = :isBanned")
            ->andWhere("m.community = :community")
            ->setParameter(":community", $community)
            ->setParameter(":isBanned", $isBanned)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findOneByUnlessRestricted(Community $community, User $user, bool $isBanned): Member|null    {
        return $this->createQueryBuilder("m")
            ->join(User::class, "u", Join::WITH, "m.user = u")
            ->andWhere("u.isRestricted = false")
            ->andWhere("m.isBanned = :isBanned")
            ->andWhere("m.community = :community")
            ->andWhere("u = :user")
            ->setParameter(":user", $user)
            ->setParameter(":community", $community)
            ->setParameter(":isBanned", $isBanned)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }    public function countMembersForCommunityExceptRestricted(Community $community, bool $isBanned): int
    {
        return (int) $this->createQueryBuilder("m")
            ->select('COUNT(m.id)')
            ->join(User::class, "u", Join::WITH, "m.user = u")
            ->andWhere("u.isRestricted = false")
            ->andWhere("m.isBanned = :isBanned")
            ->andWhere("m.community = :community")
            ->setParameter(":community", $community)
            ->setParameter(":isBanned", $isBanned)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
}
