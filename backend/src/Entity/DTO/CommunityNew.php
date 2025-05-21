<?php

namespace App\Entity\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\Choice;

class CommunityNew
{
    #[Assert\NotBlank]
    #[Groups(["community_new"])]
    public string $name;

    #[Assert\NotBlank]
    #[Groups(["community_new"])]
    public string $location;

    #[Groups(["community_new"])]
    public ?string $description = null;

    #[Groups(["community_new"])]
    #[Assert\Length(
        min: 8,
        max: 64,
        minMessage: 'Password must be at least {{ limit }} characters long.',
        maxMessage: 'Password cannot be longer than {{ limit }} characters.'
    )]
    public ?string $password = null;

    #[Groups(["community_new"])]
    #[Choice(["Public","Private"])]
    public string $visibility = "Public";

    #[Groups(["community_new"])]
    public string $image;
}
