<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
    }

    public function checkPostAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->isRestricted()) {
            throw new CustomUserMessageAccountStatusException(
                'Your account has been restricted.' .
                ($user->getRestrictReason() !== null ? ' Reason: ' . $user->getRestrictReason() : '')
            );
        }
    }
}
