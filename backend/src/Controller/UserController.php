<?php

namespace App\Controller;

use App\Entity\DTO\UserEdit;
use App\Entity\Enum\ItemStatusEnum;
use App\Entity\User;
use App\Repository\CommunityRepository;
use App\Service\ItemService;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class UserController extends AbstractController
{
    #[View()]
    #[Route('/api/register', methods: ['POST'])]
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
                response: 422,
                description: 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.'
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
        #[MapRequestPayload(
            serializationContext:["groups"=>["user_login","user_register"]],
            validationGroups: ["user_register"]
        )] User $user
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
    #[Route('/api/login', methods: ['POST'], name: 'api_login')] 
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

    #[View(serializerGroups: ["community_basic"])]
    #[Route(path:"/api/users/communities", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Get the list of comunities joined by the user.",
        tags: ["Users"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of communities',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/Community"))
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
        ]

    )]
    public function getCommunities(
        CommunityRepository $communityRepository,
        UrlGeneratorInterface $urlGen,
        #[CurrentUser()] User $user
    ) {
        // Get its communities
        $communities = $communityRepository->findAllForUser($user);
        foreach ($communities as $community) {
            $community
                ->setImageUrl($urlGen->generate('api_communities_image', ['id' => $community->getId()]))
                ->setMemberCount(count($community->getMembers()))
            ;
        };
        return $communities;
    }


    // DELETE USER AVATAR


    #[View()]
    #[Route(path:"/api/users/delete-avatar", methods: ["DELETE"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Delete(
        tags: ['Users'],
        summary: 'Delete the user avatar',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successsfuly deleted the user avatar',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            )
        ]
    )]    
    public function deleteAvatar(
        EntityManagerInterface $em,
        #[CurrentUser()] User $user
    )
    {
        // Edit
        $user->setAvatar(null);
        // Save
        $em->persist($user);
        $em->flush();

        return new JsonResponse("Successsfuly deleted the user's avatar");
    }


    // EDIT 


    #[View(serializerGroups: ["user_basic"])]
    #[Route(path:"/api/users", methods: ["PATCH", "POST"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Users'],
        summary: 'Update user settings and avatar',
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: [
                        new OA\Property(property: '_method', type: 'string', example: 'PATCH', description: 'Method override for browsers and file upload compatibility'),
                        new OA\Property(property: 'avatar', type: 'string', format: 'binary'),
                        new OA\Property(property: 'firstName', type: 'string', description: 'first name'),
                        new OA\Property(property: 'lastName', type: 'string', description: 'last name'),
                        new OA\Property(property: 'password', type: 'string', description: 'password'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Settings updated successfuly',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 422,
                description: 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.'
            ),
        ]
    )]    
    public function edit(
        Request $request,
        EntityManagerInterface $em,
        #[CurrentUser()] User $user,
        UserPasswordHasherInterface $userPasswordHasher,
        UserService $userService,
        ValidatorInterface $validator
    )
    {
        // Manually populate DTO 
        $dto = new UserEdit();
        $dto->firstName = $request->request->get('firstName');
        $dto->lastName = $request->request->get('lastName');
        $dto->password = $request->request->get('password');
        
        // Check password
        $violations = $validator->validate($dto);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[] = [
                    'field' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage(),
                ];
            }
            return new JsonResponse(['errors' => $errors], 422);
        }

        // Edit
        $dto->update($user, $userPasswordHasher);
        $dto->updateAvatar($request, $user);

        // Save
        $em->persist($user);
        $em->flush();

        // Set values for return
        $userService->generateAvatarUrl($user);

        return $user;
    }




    // DEFAULT AVATAR

    #[Route(path:'/images/default-avatar.png', methods: ['GET'], name:"api_default_avatar")]
    public function getDefaultAvatar(ParameterBagInterface $params)
    {

        // Get path
        $projectDir = $params->get('kernel.project_dir');
        $imageName = "default-avatar.png";
        $imagePath = $projectDir . '/public/' . $imageName;

        // Check file
        if (!file_exists($imagePath)) {
            throw $this->createNotFoundException("Image not found");
        }

        // Get content
        $imageContent = file_get_contents($imagePath);

        // Return image
        return new Response($imageContent, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'inline; filename="'.$imageName.'"',
        ]);
    }


    // AVATAR

    #[Route(path:'/images/users/{id}.png', methods: ['GET'], name:"api_user_avatar")]
    public function getAvatar(User $user, ParameterBagInterface $params)
    {
        // Get user's avatar
        $imageContent = $user->getAvatar();

        if ($imageContent === null) {
            // Show default avatar endpoint
            return $this->getDefaultAvatar($params);
        }

        // Return image
        return new Response(stream_get_contents($imageContent), 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'inline; filename="'. $user->getFirstName() . $user->getLastName() .'.png"',
        ]);
    }



    // User RESERVATIONS


    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/users/items/reservations", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Get the list of items you are reserving at the moment.",
        tags: ["Users"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of items',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/Item"))
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
        ]

    )]
    public function getReservations(
        ItemService $itemService,
        #[CurrentUser()] User $user
    ) {
        // Return its reserved items
        return $itemService->getItemsOnCriteria([
            "receiver" => $user,
            "status" => ItemStatusEnum::RESERVED
        ]);
    }



    // User DONATIONS


    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/users/items/donations", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Get the list of items you are donating and have donated in the past.",
        tags: ["Users"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of items',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/Item"))
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
        ]

    )]
    public function getDonations(
        ItemService $itemService,
        #[CurrentUser()] User $user
    ) {
        // Return user donation items
        return $itemService->getItemsOnCriteria(["donor"=>$user]);
    }



    // User RECEIPTS


    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/users/items/receipts", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Get the list of items you received.",
        tags: ["Users"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of items',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/Item"))
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
        ]

    )]
    public function getReceipts(
        ItemService $itemService,
        #[CurrentUser()] User $user
    ) {
        // Return user received items
        return $itemService->getItemsOnCriteria([
            "receiver"=>$user,
            "status"=>ItemStatusEnum::OVER
        ]);
    }

}
