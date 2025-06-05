<?php

namespace App\Repository;

use App\Entity\Community;
use App\Entity\Member;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Community>
 */
class CommunityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Community::class);
    }

    /**
     * @return Community[] Returns an array of Community objects
     */
    public function findAllForUser(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.members', 'm')
            ->join('m.user', 'u')
            ->andWhere('u.id = :id')
            ->andWhere('m.isBanned = 0')
            ->setParameter('id', $user->getId())
            ->getQuery()
            ->getResult()
        ;
    }
}
