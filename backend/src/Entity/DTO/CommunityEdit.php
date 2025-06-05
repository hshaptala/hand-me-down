<?php

namespace App\Entity\DTO;

use App\Entity\Community;
use App\Entity\Enum\VisibilityEnum;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\PasswordHasher\PasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\Choice;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class CommunityEdit
{
    #[Groups(["community_edit"])]
    public ?string $name = null;

    #[Groups(["community_edit"])]
    public ?string $location = null;

    #[Groups(["community_edit"])]
    public ?string $description = null;

    #[Groups(["community_edit"])]
    public ?string $password = null;

    #[Groups(["community_edit"])]
    #[Choice(["Public","Private"])]

    public ?string $visibility = null;

    #[Groups(["community_edit"])]
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


    public function update(Community $community, PasswordHasherInterface $passwordHasher)
    {
        $community
            ->setName($this->name !== null && strlen($this->name) > 0 ? $this->name : $community->getName())
            ->setDescription($this->description !== null && strlen($this->description) > 0 ? $this->description : $community->getDescription())
            ->setVisibility($this->visibility !== null && strlen($this->visibility) > 0 ? VisibilityEnum::tryFrom($this->visibility) : $community->getVisibility())
            ->setLocation($this->location !== null && strlen($this->location) > 0 ? $this->location : $community->getLocation())
        ;

        // If it is a private communtiy
        if ($community->getVisibility() === VisibilityEnum::PRIVATE) {
            // If a password was given: change it
            if ($this->password !== null && strlen($this->password) > 0) {
                $community->setPassword($passwordHasher->hash($this->password));
            }
            // If the community still has no password: throw error
            if ($community->getPassword() === null || strlen($community->getPassword()) == 0) {
                throw new UnprocessableEntityHttpException('A private community needs a password');
            }
        }
    }

    public function updateImage(Request $request, Community $community)
    {
        // Read image content
        $file = $request->files->get('image');
        if ($file !== null) { // Make sure an image was sent
            $stream = fopen($file->getPathname(), 'rb');
            // Set image
            $community->setImage(stream_get_contents($stream));
            fclose($stream);
        }
    }
}
