<?php

namespace App\Entity\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

class ItemNew
{
    #[Assert\NotBlank]
    #[Groups(["item_new"])]
    public string $title;

    #[Groups(["item_new"])]
    public ?string $description = null;

    #[Groups(["item_new"])]
    public ?string $image = null;
}
