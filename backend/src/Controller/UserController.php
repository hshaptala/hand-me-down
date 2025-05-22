<?php

namespace App\Controller;

use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
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
        responses: [
            new OA\Response(
                response: 200,
                description: 'Registration successfull',
                content: new OA\JsonContent(example:"access_token")
            ),
            new OA\Response(
                response: 500,
                description: 'An error occured.'
            )
        ],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType:'application/json',
            schema: new OA\Schema(
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: [
                    new OA\Property(property: 'email', type: 'email', description: 'email', example: 'user@user.com'),
                    new OA\Property(property: 'firstName', type: 'string', description: 'first name', example: 'John'),
                    new OA\Property(property: 'lastName', type: 'string', description: 'last name', example: 'Doe'),
                    new OA\Property(property: 'password', type: 'string', description: 'password', example:'password'),
                ]
            )
        )
    )] 
    public function register(
        EntityManagerInterface $em,
        UserPasswordHasherInterface $userPasswordHasher,
        #[MapRequestPayload(serializationContext:["groups"=>["user_login","user_register"]])] User $user
    ){

        // email already used
        $existing = $em->getRepository(User::class)->findOneBy(['email' => $user->getEmail()]);
        if ($existing) {
            return $this->json([
                'errors' => [
                    'error' => 'Something went wrong.',
                ]
            ], 500);
        }

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
        return $user->getToken();
    }


    #[View()] 
    #[Route('/login', methods: ['POST'], name: 'api_login')] 
    #[OA\Post( 
       summary: "Login", 
       tags: ["Users"],
       responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful',
                content: new OA\JsonContent(example:"access_token")
            ),
            new OA\Response(
                response: 401,
                description: 'Invalid credentials.'
            )
        ],
    )] 
    #[OA\RequestBody(content: 
       new OA\JsonContent( 
           example: '{"username": "user@user.com", "password": "password"}' 
    ))] 
    public function login(#[CurrentUser()] User $user)
    {
        return $user->getToken();
    }


    #[View()]
    #[Route(path:"/users/roles", methods: ["GET"], name:"api_user_roles")]
    #[OA\Get(
        summary: "Get the list of all the roles users can have in communities.",
        tags: ["Users"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of roles',
            )
        ]
    )] 
    public function getRoles()
    {
        return CommunityRoleEnum::cases();
    }
}
