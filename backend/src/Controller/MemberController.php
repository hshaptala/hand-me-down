<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\Member;
use App\Entity\User;
use App\Repository\MemberRepository;
use App\Service\CommunityService;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route(path:"/api")]
final class MemberController extends AbstractController
{

    // Get Roles

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


    // LIST


    #[View(serializerGroups: ["member_basic"])]
    #[Route(path:"/communities/{id}/members", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get the member list of a community.",
        tags: ["Members"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of members',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: new Model(type: Member::class, groups: ['member_basic'])))
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
                description: 'Community not found',
            ),
        ]
    )] 
    public function members(
        Community $community,
        MemberRepository $memberRepository,
        UrlGeneratorInterface $urlGen
    )
    {
        $members = $memberRepository->findByCommunity($community);
        
        // Generate AvatarUrl
        foreach ($members as $member) {
            if($member->getUser()->getAvatar() === null){
                $member->getUser()
                    ->setAvatarUrl($urlGen->generate('api_default_avatar'))
                ;
            }else{
                $member->getUser()
                    ->setAvatarUrl($urlGen->generate('api_user_avatar', ['id' => $member->getUser()->getId()]))
                ;
            }
        };
        return $members;
    }

    // Get ONE SPECIFIC


    #[View(serializerGroups: ["member_basic"])]
    #[Route(path:"/communities/{communityId}/members/{memberId}", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get the information about a member.",
        tags: ["Members"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Member object',
                content: new OA\JsonContent( type: 'object', ref: new Model(type: Member::class, groups: ['member_basic']))
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
                description: 'Community not found',
            ),
        ]
    )] 
    public function member(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'memberId')] Member $member,
        UrlGeneratorInterface $urlGen
    )
    {
        // Generate AvatarUrl
        if($member->getUser()->getAvatar() === null){
            $member->getUser()
                ->setAvatarUrl($urlGen->generate('api_default_avatar'))
            ;
        }else{
            $member->getUser()
                ->setAvatarUrl($urlGen->generate('api_user_avatar', ['id' => $member->getUser()->getId()]))
            ;
        }
      
        return $member;
    }





    

    // EDIT ROLE

    #[View(serializerGroups: ["member_basic"])]
    #[Route(path:"/communities/{communityId}/members/{memberId}", methods: ["PATCH"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_MANAGE_ROLES', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Patch(
        summary: "Change the role of a member.",
        tags: ["Members"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Member object',
                content: new OA\JsonContent( type: 'object', ref: new Model(type: Member::class, groups: ['member_basic']))
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
                description: 'Community not found',
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid role input',
            ),
        ]
    )] 
    public function edit(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'memberId')] Member $member,
        #[OA\Parameter( 
           description: "New role", 
           in: "query", 
           required: false, 
           example: "member",
       )] 
        #[MapQueryParameter()] ?string $role,
        EntityManagerInterface $em,
    )
    {
        if($role !== null){
            // Get Role
            $role = CommunityRoleEnum::tryFrom($role);
            if($role === null){
                return $this->json([
                    'errors' => [
                        'name' => 'Invalid role',
                    ]
                ], 422);
            }

            // Set
            // /!\ No limitations for role changing
            $member->setRole($role);

            // Save
            $em->persist($member);
            $em->flush();
        }

        return $member;
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