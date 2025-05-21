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
        $em->persist($user);
        $em->flush();
    }
}
