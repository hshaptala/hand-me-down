<?php

namespace App\Controller;

use App\Entity\User;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route("/api")]
final class RatingController extends AbstractController
{
    #[View()]
    #[Route('/ratings', methods:['POST'])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Ratings'],
        summary: 'Leave a review to another user you have worked with.',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Rating sent successfully',
                // content: new OA\JsonContent(ref: "#/components/schemas/Item")
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'User not found',
            ),
            new OA\Response(
                response: 409,
                description: 'Already left a rating for this user',
            ),
        ]
    )]
    public function new(
        #[CurrentUser()] User $user,
        #[OA\Parameter( 
           description: "Target user id", 
           in: "query", 
           required: true,
        )] 
        #[MapQueryParameter()] ?User $to,
        #[OA\Parameter( 
           description: "Number between 1 and 5", 
           in: "query", 
           required: true,
        )] 
        #[MapQueryParameter()] ?int $rating,
        #[OA\Parameter( 
           description: "Message", 
           in: "query", 
           required: false,
        )] 
        #[MapQueryParameter()] ?int $message,
    )
    {
        
    }
}
