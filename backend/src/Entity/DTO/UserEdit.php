<?php

namespace App\Entity\DTO;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Annotation\Groups;

class UserEdit
{
    #[Groups(["avatar"])]
    public ?string $avatar = null;

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
