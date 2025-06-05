<?php

namespace App\Repository;

use App\Entity\Rating;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Rating>
 */
class RatingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Rating::class);
    }

    public function average (User $user): float|null
    {
        return $this->createQueryBuilder("r")
            ->select("avg(r.grade)")
            ->andWhere("r.userRated = :user")
            ->setParameter(":user", $user)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
}
