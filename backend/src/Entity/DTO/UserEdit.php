<?php

namespace App\Entity\DTO;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\PasswordHasher\PasswordHasherInterface;
use Symfony\Component\Serializer\Annotation\Groups;

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
