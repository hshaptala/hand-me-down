<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\User;
use App\Service\CommunityService;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route(path:"/api")]
final class MemberController extends AbstractController
{

    #[View()]
    #[Route(path:"/members/roles", methods: ["GET"])]
    #[OA\Get(
        summary: "Get the list of all the roles users can have in communities.",
        tags: ["Members"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of strings',
            )
        ]
    )] 
    public function getRoles()
    {
        return CommunityRoleEnum::cases();
    }

    // JOIN




    #[View()]
    #[Route(path:"/communities/{id}/join", methods: ["POST"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Members'],
        summary: 'Join a community',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Community joined successfully',
            ),
            new OA\Response(
                response: 400,
                description: 'No password provided',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Reached maximum community joined.',
            ),
            new OA\Response(
                response: 404,
                description: 'Community not found.',
            ),
            new OA\Response(
                response: 409,
                description: 'Already joined',
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid password',
            )
        ]
    )]    public function join(
        Community $community,
        #[OA\Parameter( 
           description: "Password for private communities", 
           in: "query", 
           required: false, 
           example: "secret123" 
       )] 
        #[MapQueryParameter()] ?string $password,
        #[CurrentUser()] User $user,
        CommunityService $communityService
    )
    {
        // Check User
        if ($user === null){ 
           throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource."); 
        }

        // Get community
        if (!$community){
            return throw new UnprocessableEntityHttpException('Invalid community id');
        }

        // Join
        $communityService->join($user, $community, $password);

        return new JsonResponse("Successfully joined community",200);
    }




    // LEAVE




    #[View()]
    #[Route(path:"/communities/{id}/leave", methods: ["DELETE"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Delete(
        tags: ['Members'],
        summary: 'Leave a community',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Community left successfully',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 404,
                description: 'Community not found.',
            ),
            new OA\Response(
                response: 409,
                description: 'Not in community',
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid password',
            )
        ]
    )]    public function leave(
        Community $community,
        #[CurrentUser()] User $user,
        CommunityService $communityService
    )
    {
        // Check User
        if ($user === null){ 
           return throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource."); 
        }

        // Leave
        $communityService->leave($user, $community);

        return new JsonResponse("Successfully left community",200);
    }

}