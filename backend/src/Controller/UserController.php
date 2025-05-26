<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\User;
use App\Repository\CommunityRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route(path: "/api")]
final class UserController extends AbstractController
{
    #[View(serializerGroups: ["community_basic"])]
    #[Route(path: "/users/communities", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Get the list of comunities joined by the user.",
        tags: ["Users"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of communities',
                content: new OA\JsonContent(ref: new Model(type: Community::class, groups: ['community_basic']))
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
        // Check User
        if ($user === null) {
            throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource.");
        }
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
}
