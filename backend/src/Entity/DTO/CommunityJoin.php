<?php

namespace App\Entity\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

class CommunityJoin
{
    #[Assert\NotBlank]
    #[Groups(["community_join"])]
    public int $communityId;

    #[Groups(["community_join"])]
    public ?string $password = null;
}