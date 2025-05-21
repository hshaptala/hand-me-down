<?php

namespace App\Entity;

use App\Entity\Enum\VisibilityEnum;
use App\Repository\CommunityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use OpenApi\Attributes as OA;

#[ORM\Entity(repositoryClass: CommunityRepository::class)]
class Community
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['community_basic','community_new'])]
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[Groups(['community_basic','community_new'])]
    #[ORM\Column(length: 255)]
    private ?string $location = null;

    #[Groups(['community_basic','community_new'])]
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[Groups(['community_new'])]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $password = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $created_at = null;

    /**
     * @var Collection<int, Item>
     */
    #[ORM\OneToMany(targetEntity: Item::class, mappedBy: 'community')]
    private Collection $items;

    #[Groups(['community_basic','community_new'])]
    #[ORM\Column(enumType: VisibilityEnum::class)]
    private ?VisibilityEnum $visibility = null;

    #[Groups(['community_new'])]
    #[OA\Property(property:'image', type:'string', format:'binary')]
    #[ORM\Column(type: Types::BLOB)]
    private $image = null;

    #[Groups(['community_basic'])]
    private $imageUrl = null;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(string $location): static
    {
        $this->location = $location;

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

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(?\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    /**
     * @return Collection<int, Item>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(Item $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setCommunity($this);
        }

        return $this;
    }

    public function removeItem(Item $item): static
    {
        if ($this->items->removeElement($item)) {
            // set the owning side to null (unless already changed)
            if ($item->getCommunity() === $this) {
                $item->setCommunity(null);
            }
        }

        return $this;
    }

    public function getVisibility(): ?VisibilityEnum
    {
        return $this->visibility;
    }

    public function setVisibility(VisibilityEnum $visibility): static
    {
        $this->visibility = $visibility;

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


    public function setImageUrl(string $url): void
    {
        $this->imageUrl = $url;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }
}
