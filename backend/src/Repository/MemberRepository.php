<?php

namespace App\Repository;

use App\Entity\Member;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
        ;

        return $result !== null && $result["banCount"] !== null ? $result["banCount"] : 0 ;
    }
}
