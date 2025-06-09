<?php

namespace App\Entity;

use App\Entity\Enum\ItemStatusEnum;
use App\Repository\ItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ItemRepository::class)]
class Item
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['item_basic'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['item_basic'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['item_basic'])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'items')]
    private ?Community $community = null;

    #[ORM\ManyToOne(inversedBy: 'donations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['item_basic'])]
    private ?User $donor = null;

    #[ORM\ManyToOne(inversedBy: 'receipts')]
    #[Groups(['item_basic'])]
    private ?User $receiver = null;

    #[ORM\Column(enumType: ItemStatusEnum::class)]
    #[Groups(['item_basic'])]
    private ?ItemStatusEnum $status = null;

    #[ORM\Column(type: Types::SIMPLE_ARRAY, nullable: true)]
    #[Groups(['item_basic'])]
    private array $keywords = [];

    #[ORM\Column]
    private ?\DateTimeImmutable $postedAt = null;

    #[ORM\Column(type: Types::BLOB)]
    private $image = null;

    #[Groups(['item_basic'])]
    private $imageUrl = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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

    public function getDonor(): ?User
    {
        return $this->donor;
    }

    public function setDonor(?User $donor): static
    {
        $this->donor = $donor;

        return $this;
    }

    public function getReceiver(): ?User
    {
        return $this->receiver;
    }

    public function setReceiver(?User $receiver): static
    {
        $this->receiver = $receiver;

        return $this;
    }

    public function getStatus(): ?ItemStatusEnum
    {
        return $this->status;
    }

    public function setStatus(ItemStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getKeywords(): array
    {
        return $this->keywords;
    }

    public function setKeywords(array $keywords): static
    {
        $this->keywords = $keywords;

        return $this;
    }

    public function getPostedAt(): ?\DateTimeImmutable
    {
        return $this->postedAt;
    }

    public function setPostedAt(\DateTimeImmutable $postedAt): static
    {
        $this->postedAt = $postedAt;

        return $this;
    }

    public function getImage()
    {
        return $this->image;
    }

    public function setImage($image): static
    {
        $this->image = $image;

        return $this;
    }
    public function setImageUrl(string $url): static
    {
        $this->imageUrl = $url;
        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }
}
