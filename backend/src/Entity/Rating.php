<?php

namespace App\Entity;

use App\Repository\RatingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: RatingRepository::class)]
class Rating
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['rating_basic'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'ratingsGiven')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['rating_basic'])]
    private ?User $userRating = null;

    #[ORM\ManyToOne(inversedBy: 'ratingsRecieved')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['rating_basic'])]
    private ?User $userRated = null;

    #[ORM\Column(nullable: false)]
    #[Groups(['rating_basic'])]
    private ?int $grade = null;

    #[ORM\Column(length: 1000, nullable: true)]
    #[Groups(['rating_basic'])]
    private ?string $message = null;

    #[ORM\Column]
    #[Groups(['rating_basic'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserRating(): ?User
    {
        return $this->userRating;
    }

    public function setUserRating(?User $userRating): static
    {
        $this->userRating = $userRating;

        return $this;
    }

    public function getUserRated(): ?User
    {
        return $this->userRated;
    }

    public function setUserRated(?User $userRated): static
    {
        $this->userRated = $userRated;

        return $this;
    }

    public function getGrade(): ?int
    {
        return $this->grade;
    }

    public function setGrade(int $grade): static
    {
        $this->grade = $grade;

        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
