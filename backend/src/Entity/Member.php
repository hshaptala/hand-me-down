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

    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'memberships')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['member_basic','member_ban'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'members')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Community $community = null;

    #[ORM\Column(enumType: CommunityRoleEnum::class)]
    #[Groups(['member_basic'])]
    private ?CommunityRoleEnum $role = CommunityRoleEnum::MEMBER;

    #[ORM\Column(options: ["default" => false])]
    #[Groups(['member_ban'])]
    private ?bool $isBanned = false;

    #[ORM\Column(options: ["default" => 0])]
    #[Groups(['member_ban'])]
    private ?int $banCount = 0;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['member_ban'])]
    private ?string $banReason = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['member_ban'])]
    private ?\DateTimeImmutable $lastBannedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['member_ban'])]
    private ?\DateTimeImmutable $lastUnbannedAt = null;

    #[ORM\ManyToOne]
    #[Groups(['member_ban'])]
    private ?User $lastBannedBy = null;

    #[ORM\ManyToOne]
    #[Groups(['member_ban'])]
    private ?User $lastUnbannedBy = null;

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

    public function isBanned(): ?bool
    {
        return $this->isBanned;
    }

    public function setIsBanned(bool $isBanned): static
    {
        $this->isBanned = $isBanned;

        return $this;
    }

    public function getBanCount(): ?int
    {
        return $this->banCount;
    }

    public function incrementBanCount(): static
    {
        $this->banCount += 1;

        return $this;
    }

    public function getBanReason(): ?string
    {
        return $this->banReason;
    }

    public function setBanReason(?string $banReason): static
    {
        $this->banReason = $banReason;

        return $this;
    }

    public function getLastBannedAt(): ?\DateTimeImmutable
    {
        return $this->lastBannedAt;
    }

    public function setLastBannedAt(\DateTimeImmutable $lastBannedAt): static
    {
        $this->lastBannedAt = $lastBannedAt;

        return $this;
    }

    public function getLastUnbannedAt(): ?\DateTimeImmutable
    {
        return $this->lastUnbannedAt;
    }

    public function setLastUnbannedAt(?\DateTimeImmutable $lastUnbannedAt): static
    {
        $this->lastUnbannedAt = $lastUnbannedAt;

        return $this;
    }

    public function getLastBannedBy(): ?User
    {
        return $this->lastBannedBy;
    }

    public function setLastBannedBy(?User $lastBannedBy): static
    {
        $this->lastBannedBy = $lastBannedBy;

        return $this;
    }

    public function getLastUnbannedBy(): ?User
    {
        return $this->lastUnbannedBy;
    }

    public function setLastUnbannedBy(?User $lastUnbannedBy): static
    {
        $this->lastUnbannedBy = $lastUnbannedBy;

        return $this;
    }
}
