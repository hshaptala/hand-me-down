<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['item_basic','member_basic','community_basic','member_ban','user_basic'])]
    private ?int $id = null;

    #[Groups(['user_login'])]
    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[Assert\NotBlank(groups: ['user_register'])]
    #[Assert\Regex(
        pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}$/',
        message: 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.',
        groups: ['user_register']
    )]
    #[Groups(['user_login'])]
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $token = null;


    #[Groups(['user_register'])]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $supabaseUserId = null;

    /**
     * @var Collection<int, Community>
     */
    #[ORM\OneToMany(targetEntity: Community::class, mappedBy: 'owner')]
    private Collection $communitiesOwned;

    #[ORM\Column(length: 255)]
    #[Groups(['user_register','user_basic','member_basic','member_ban'])]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user_register','user_basic','member_basic','member_ban'])]
    private ?string $lastName = null;

    /**
     * @var Collection<int, Member>
     */
    #[ORM\OneToMany(targetEntity: Member::class, mappedBy: 'user')]
    private Collection $memberships;

    #[ORM\Column(type: Types::BLOB, nullable: true)]
    private $avatar = null;

    #[Groups(['user_basic','member_basic'])]
    private ?string $avatarUrl = null;

    /**
     * @var Collection<int, Item>
     */
    #[ORM\OneToMany(targetEntity: Item::class, mappedBy: 'donor')]
    private Collection $donations;

    /**
     * @var Collection<int, Item>
     */
    #[ORM\OneToMany(targetEntity: Item::class, mappedBy: 'receiver')]
    private Collection $receipts;

    #[ORM\Column]
    #[Groups(['user_info'])]
    private ?\DateTimeImmutable $joinedAt = null;

    #[Groups(['user_info'])]
    private ?int $communityCount = null;

    #[Groups(['user_info'])]
    private ?int $itemsReceivedCount = null;

    #[Groups(['user_info'])]
    private ?int $itemsGivenCount = null;

    #[Groups(['user_info'])]
    private ?float $rating = null;

    #[ORM\Column(options: ["default" => false])]
    private ?bool $isRestricted = false;

    public function __construct()
    {
        $this->communitiesOwned = new ArrayCollection();
        $this->memberships = new ArrayCollection();
        $this->donations = new ArrayCollection();
        $this->receipts = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getSupabaseUserId(): ?string
    {
        return $this->supabaseUserId;
    }

    public function setSupabaseUserId(?string $supabaseUserId): static
    {
        $this->supabaseUserId = $supabaseUserId;
        return $this;
    }

    /**
     * @return Collection<int, Community>
     */
    public function getCommunitiesOwned(): Collection
    {
        return $this->communitiesOwned;
    }

    public function addCommunityOwned(Community $community): static
    {
        if (!$this->communitiesOwned->contains($community)) {
            $this->communitiesOwned->add($community);
            $community->setOwner($this);
        }

        return $this;
    }

    public function removeCommunityOwned(Community $community): static
    {
        if ($this->communitiesOwned->removeElement($community)) {
            // set the owning side to null (unless already changed)
            if ($community->getOwner() === $this) {
                $community->setOwner(null);
            }
        }

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    /**
     * @return Collection<int, Member>
     */
    public function getMemberships(): Collection
    {
        return $this->memberships;
    }

    public function addMembership(Member $membership): static
    {
        if (!$this->memberships->contains($membership)) {
            $this->memberships->add($membership);
            $membership->setUser($this);
        }

        return $this;
    }

    public function removeMembership(Member $membership): static
    {
        if ($this->memberships->removeElement($membership)) {
            // set the owning side to null (unless already changed)
            if ($membership->getUser() === $this) {
                $membership->setUser(null);
            }
        }

        return $this;
    }

    public function getAvatar(): mixed
    {
        return $this->avatar;
    }

    public function setAvatar($avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function setAvatarUrl(string $url): static
    {
        $this->avatarUrl = $url;
        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    /**
     * @return Collection<int, Item>
     */
    public function getDonations(): Collection
    {
        return $this->donations;
    }

    public function addDonation(Item $donation): static
    {
        if (!$this->donations->contains($donation)) {
            $this->donations->add($donation);
            $donation->setDonor($this);
        }

        return $this;
    }

    public function removeDonation(Item $donation): static
    {
        if ($this->donations->removeElement($donation)) {
            // set the owning side to null (unless already changed)
            if ($donation->getDonor() === $this) {
                $donation->setDonor(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Item>
     */
    public function getReceipts(): Collection
    {
        return $this->receipts;
    }

    public function addReceipt(Item $receipt): static
    {
        if (!$this->receipts->contains($receipt)) {
            $this->receipts->add($receipt);
            $receipt->setReceiver($this);
        }

        return $this;
    }

    public function removeReceipt(Item $receipt): static
    {
        if ($this->receipts->removeElement($receipt)) {
            // set the owning side to null (unless already changed)
            if ($receipt->getReceiver() === $this) {
                $receipt->setReceiver(null);
            }
        }

        return $this;
    }

    public function getJoinedAt(): ?\DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(\DateTimeImmutable $joinedAt): static
    {
        $this->joinedAt = $joinedAt;

        return $this;
    }

    public function getCommunityCount(): ?int
    {
        return $this->communityCount;
    }

    public function setCommunityCount(int $communityCount): static
    {
        $this->communityCount = $communityCount;

        return $this;
    }

    public function getItemsReceivedCount(): ?int
    {
        return $this->itemsReceivedCount;
    }

    public function setItemsReceivedCount(int $itemsReceivedCount): static
    {
        $this->itemsReceivedCount = $itemsReceivedCount;

        return $this;
    }

    public function getItemsGivenCount(): ?int
    {
        return $this->itemsGivenCount;
    }

    public function setItemsGivenCount(int $itemsGivenCount): static
    {
        $this->itemsGivenCount = $itemsGivenCount;

        return $this;
    }

    public function getRating(): ?float
    {
        return $this->rating;
    }

    public function setRating(float $rating): static
    {
        $this->rating = $rating;

        return $this;
    }

    public function isRestricted(): ?bool
    {
        return $this->isRestricted;
    }

    public function setIsRestricted(bool $isRestricted): static
    {
        $this->isRestricted = $isRestricted;

        return $this;
    }
}
