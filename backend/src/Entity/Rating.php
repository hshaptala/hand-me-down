<?php

namespace App\Entity;

use App\Repository\RatingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RatingRepository::class)]
class Rating
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'ratingsGiven')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $userRating = null;

    #[ORM\ManyToOne(inversedBy: 'ratingsRecieved')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $userRated = null;

    #[ORM\Column(nullable: false)]
    private ?int $grade = null;

    #[ORM\Column(length: 1000, nullable: true)]
    private ?string $message = null;

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

    public function setMessage(string $message): static
    {
        $this->message = $message;

        return $this;
    }
}
