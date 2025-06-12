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
    public ?string $newPassword = null;
    #[Groups(["user_edit"])]
    public ?string $currentPassword = null;
    #[Groups(["user_edit"])]
    public ?string $confirmPassword = null;
    #[Groups(["user_edit"])]
    public ?string $avatar = null;


    private UserPasswordHasherInterface $userPasswordHasher;
    private User $toUpdate;

    public function __construct(User $user, UserPasswordHasherInterface $userPasswordHasherInterface)
    {
        $this->userPasswordHasher = $userPasswordHasherInterface;
        $this->toUpdate = $user;
    }

    #[Assert\Callback]
    public function validatePasswordRequirement(ExecutionContextInterface $context): void
    {
        // IF only a new password is given
        if (strlen($this->newPassword) > 0) {
            // Check current password is correct
            if (
                $this->currentPassword === null
                || strlen($this->currentPassword) === 0
                || !$this->userPasswordHasher->isPasswordValid($this->toUpdate, $this->currentPassword)
            ) {
                $context->buildViolation('Password invalid.')
                    ->atPath('password')
                    ->addViolation()
                ;
            }

            // Check both passwords are the same
            if (
                $this->confirmPassword === null
                || $this->confirmPassword !== $this->newPassword
            ) {
                $context->buildViolation('Password invalid.')
                    ->atPath('password')
                    ->addViolation()
                ;
            }

            // Check password
            if (strlen($this->newPassword) < 8) {
                $context->buildViolation('Password must be at least 8 characters.')
                    ->atPath('password')
                    ->addViolation();
            }

            if (!preg_match('/[A-Z]/', $this->newPassword)) {
                $context->buildViolation('Password must contain at least one uppercase letter.')
                    ->atPath('password')
                    ->addViolation();
            }

            if (!preg_match('/[a-z]/', $this->newPassword)) {
                $context->buildViolation('Password must contain at least one lowercase letter.')
                    ->atPath('password')
                    ->addViolation();
            }

            if (!preg_match('/[\W]/', $this->newPassword)) {
                $context->buildViolation('Password must contain at least one special character.')
                    ->atPath('password')
                    ->addViolation();
            }
        }
    }


    public function update()
    {
        $this->toUpdate
            ->setFirstName($this->firstName !== null && strlen($this->firstName) > 0 ? $this->firstName : $this->toUpdate->getFirstName())
            ->setLastName($this->lastName !== null && strlen($this->lastName) > 0 ? $this->lastName : $this->toUpdate->getLastName())
            ->setPassword($this->newPassword !== null && strlen($this->newPassword) > 0 ? $this->userPasswordHasher->hashPassword($this->toUpdate, $this->newPassword) : $this->toUpdate->getPassword())
        ;
    }

    public function updateAvatar(Request $request)
    {
        // Read image content
        $file = $request->files->get('avatar');
        if ($file !== null) { // Make sure an image was sent
            $stream = fopen($file->getPathname(), 'rb');
            // Set image
            $this->toUpdate->setAvatar(stream_get_contents($stream));
        }
    }
}
