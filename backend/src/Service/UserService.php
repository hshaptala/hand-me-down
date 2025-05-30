<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class UserService
{

    private UrlGeneratorInterface $urlGen;

    public function __construct(
        UrlGeneratorInterface $router,
        )
    {
        $this->urlGen = $router;
    }

    /**
     * Generate the url to access the user's avatar
     * @param \App\Entity\User $user
     * @return void
     */
    public function generateAvatarUrl(User $user)
    {
        if($user->getAvatar() === null){
            $user
                ->setAvatarUrl($this->urlGen->generate('api_default_avatar'))
            ;
        }else{
            $user
                ->setAvatarUrl($this->urlGen->generate('api_user_avatar', ['id' => $user->getId()]))
            ;
        }
    }
}