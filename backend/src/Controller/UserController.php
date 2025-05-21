<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
#[Route(path:"/api")]
final class UserController extends AbstractController
{
    #[View()]
    #[Route('/register', methods: ['POST'])]
    #[OA\Post(
        summary: "Create a new account",
        tags: ["Users"],
    )]
    public function register(
        EntityManagerInterface $em,
        UserPasswordHasherInterface $userPasswordHasher,
        #[MapRequestPayload(serializationContext:["groups"=>["user_login"]])]
        User $user
    ){
        $user->setPassword(
            $userPasswordHasher->hashPassword(
                $user,
                $user->getPassword()
            )
        );
        $user->setToken( 
           bin2hex(random_bytes(64)) 
        );
        $em->persist($user);
        $em->flush();
    }


    #[View()] 
    #[Route('/login', methods: ['POST'], name: 'api_login')] 
    #[OA\Post( 
       summary: "Login", 
       tags: ["Users"] 
    )] 
    #[OA\RequestBody(content: 
       new OA\JsonContent( 
           example: '{"username": "user@user.com", "password": "password"}' 
    ))] 
    public function login(#[CurrentUser()] User $user)
    {
        return $user->getToken();
    }
}
