<?php

namespace App\Entity\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\Choice;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

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
    public ?string $password = null;

    #[Groups(["community_new"])]
    #[Choice(["Public","Private"])]
    public string $visibility = "Public";

    #[Groups(["community_new"])]
    public ?string $image = null;


    #[Assert\Callback]
    public function validatePasswordRequirement(ExecutionContextInterface $context): void
    {
        if (strtolower($this->visibility) === 'private') {
            if (empty($this->password)) {
                $context->buildViolation('Password is required when community is private.')
                    ->atPath('password')
                    ->addViolation();
            } elseif (strlen($this->password) < 8) {
                $context->buildViolation('Password must be at least 8 characters.')
                    ->atPath('password')
                    ->addViolation();
            }
        }
    }
}
