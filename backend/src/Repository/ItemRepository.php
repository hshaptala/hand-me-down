<?php

namespace App\Repository;

use App\Entity\Community;
use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Item>
 */
class ItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Item::class);
    }

    public function countItemsCreatedTodayForUser(User $user): int
    {
        $todayStart = (new \DateTimeImmutable())->setTime(0, 0);
        $todayEnd = $todayStart->modify('+1 day');

        $qb = $this->createQueryBuilder('i');
        $qb->select('COUNT(i.id)')
            ->where('i.donor = :user')
            ->andWhere('i.postedAt >= :start')
            ->andWhere('i.postedAt < :end')
            ->setParameter('user', $user)
            ->setParameter('start', $todayStart)
            ->setParameter('end', $todayEnd);
        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findByExceptRestricted(Community $community, ItemStatusEnum $status): array
    {
        return $this->createQueryBuilder("i")
            ->join(User::class, "u", Join::WITH, "i.donor = u")
            ->andWhere("u.isRestricted = false")
            ->andWhere("i.status = :status")
            ->andWhere("i.community = :community")
            ->setParameter(":community", $community)
            ->setParameter(":status", $status)
            ->getQuery()
            ->getResult();
    }

    public function countItemsForCommunityExceptRestricted(Community $community, ItemStatusEnum $status): int
    {
        return (int) $this->createQueryBuilder("i")
            ->select('COUNT(i.id)')
            ->join(User::class, "u", Join::WITH, "i.donor = u")
            ->andWhere("u.isRestricted = false")
            ->andWhere("i.status = :status")
            ->andWhere("i.community = :community")
            ->setParameter(":community", $community)
            ->setParameter(":status", $status)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
