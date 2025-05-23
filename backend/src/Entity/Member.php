<?php

namespace App\Entity;

use App\Entity\Enum\CommunityRoleEnum;
use App\Repository\MemberRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MemberRepository::class)]
#[ORM\Table(name: '`member`')]
class Member
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['member_basic'])]

    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'memberships')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['member_basic'])]

    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'members')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Community $community = null;

    #[ORM\Column(enumType: CommunityRoleEnum::class)]
    #[Groups(['member_basic'])]
    private ?CommunityRoleEnum $role = CommunityRoleEnum::MEMBER;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCommunity(): ?Community
    {
        return $this->community;
    }

    public function setCommunity(?Community $community): static
    {
        $this->community = $community;

        return $this;
    }

    public function getRole(): ?CommunityRoleEnum
    {
        return $this->role;
    }

    public function setRole(CommunityRoleEnum $role): static
    {
        $this->role = $role;

        return $this;
    }
}
