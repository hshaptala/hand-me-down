<?php

namespace App\Entity\DTO;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class UserEdit
{
    #[Groups(["user_edit"])]
    public ?string $firstName = null;
    #[Groups(["user_edit"])]
    public ?string $lastName = null;
    #[Groups(["user_edit"])]
    public ?string $password = null;
    #[Groups(["user_edit"])]
    public ?string $avatar = null;

    #[Assert\Callback]
    public function validatePasswordRequirement(ExecutionContextInterface $context): void
    {
        if (strlen($this->password) > 0) {
            if (strlen($this->password) < 8) {
                $context->buildViolation('Password must be at least 8 characters.')
                    ->atPath('password')
                    ->addViolation();
            }

            if (!preg_match('/[A-Z]/', $this->password)) {
                $context->buildViolation('Password must contain at least one uppercase letter.')
                    ->atPath('password')
                    ->addViolation();
            }

            if (!preg_match('/[a-z]/', $this->password)) {
                $context->buildViolation('Password must contain at least one lowercase letter.')
                    ->atPath('password')
                    ->addViolation();
            }

            if (!preg_match('/[\W]/', $this->password)) {
                $context->buildViolation('Password must contain at least one special character.')
                    ->atPath('password')
                    ->addViolation();
            }
        }
    }


    public function update(User $user, UserPasswordHasherInterface $passwordHasher)
    {
        $user
            ->setFirstName($this->firstName !== null && strlen($this->firstName) > 0 ? $this->firstName : $user->getFirstName())
            ->setLastName($this->lastName !== null && strlen($this->lastName) > 0 ? $this->lastName : $user->getLastName())
            ->setPassword($this->password !== null && strlen($this->password) > 0 ? $passwordHasher->hashPassword($user, $this->password) : $user->getPassword())
        ;
    }

    public function updateAvatar(Request $request, User $user)
    {
        // Read image content
        $file = $request->files->get('avatar');
        if ($file !== null) { // Make sure an image was sent
            $stream = fopen($file->getPathname(), 'rb');
            // Set image
            $user->setAvatar(stream_get_contents($stream));
        }
    }
}
