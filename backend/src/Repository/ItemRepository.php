<?php

namespace App\Repository;

use App\Entity\Item;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
}
