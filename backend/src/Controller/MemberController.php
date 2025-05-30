<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\Member;
use App\Entity\User;
use App\Repository\MemberRepository;
use App\Security\CommunityVoter;
use App\Service\CommunityService;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
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
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/Member"))
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
    #[Route(path:"/communities/{communityId}/members/{userId}", methods: ["GET"])]
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
                content: new OA\JsonContent( type: 'object', ref: "#/components/schemas/Member")
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
                description: 'Community or user not found',
            ),
        ]
    )] 
    public function member(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'userId')] User $user,
        UrlGeneratorInterface $urlGen,
        MemberRepository $memberRepository
    )
    {
        // Get the member
        $member = $memberRepository->findOneBy([
            "user" => $user,
            "community" => $community,
        ]);
        
        // Make sure member exist
        if ($member === null) {
            return throw new NotFoundHttpException("User not found in this community.");
        }

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
    #[Route(path:"/communities/{communityId}/members/{userId}", methods: ["PATCH"])]
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
                content: new OA\JsonContent( type: 'object', ref: "#/components/schemas/Member")
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
                description: 'Community or user not found',
            ),
            new OA\Response(
                response: 409,
                description: 'Cant change your own role',
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid role input',
            ),
        ]
    )] 
    public function edit(
        #[MapEntity(id: 'communityId')] Community $community,
        #[CurrentUser()] User $from,
        #[MapEntity(id: 'userId')] User $to,
        #[OA\Parameter( 
           description: "New role", 
           in: "query", 
           required: false, 
           example: "member",
       )] 
        #[MapQueryParameter()] ?string $role,
        EntityManagerInterface $em,
        UrlGeneratorInterface $urlGen,
    )
    {
        // Get the member
        $member = $em->getRepository(Member::class)->findOneBy([
            "user" => $to,
            "community" => $community,
        ]);

        // Make sure member exist
        if ($member === null) {
            return throw new NotFoundHttpException("User not found in this community.");
        }

        // Make sure the user is not demoting themselves
        if ($from === $to)
        {
            return throw new ConflictHttpException("You can not change your own role!");
        }

        // Change role
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

            // Check for ownership when role is admin
            if($role === CommunityRoleEnum::ADMIN || $member->getRole() === CommunityRoleEnum::ADMIN){
                $this->denyAccessUnlessGranted(
                    CommunityVoter::MANAGE_ADMINS, 
                    $community, 
                    message:"You do not have permission to promote or demote this user to administrator."
                );
            }

            // Set
            $member->setRole($role);

            // Save
            $em->persist($member);
            $em->flush();
        }
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
        // Return updated member
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
        // Leave
        $communityService->leave($user, $community);

        return new JsonResponse("Successfully left community",200);
    }






    // GIVE OWNERSHIP

    #[View(serializerGroups: ["member_basic"])]
    #[Route(path:"/communities/{communityId}/members/{userId}/give-ownership", methods: ["Post"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_MANAGE_OWNER', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Post(
        summary: "Transfer the ownership of the community to another member",
        tags: ["Members"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Member object',
                content: new OA\JsonContent( type: 'object', ref: "#/components/schemas/Member")
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
                description: 'Community or user not found',
            ),
        ]
    )] 
    public function giveOwnership(
        #[MapEntity(id: 'communityId')] Community $community,
        #[CurrentUser()] User $from,
        #[MapEntity(id: 'userId')] User $to,
        EntityManagerInterface $em,
        UrlGeneratorInterface $urlGen,
    )
    {
        // Get the member
        $member = $em->getRepository(Member::class)->findOneBy([
            "user" => $to,
            "community" => $community,
        ]);

        // Make sure member exist
        if ($member === null) {
            return throw new NotFoundHttpException("User not found in this community.");
        }

        // Promote to administrator
        $member->setRole(CommunityRoleEnum::ADMIN);
        $community->setOwner($to);

        // Save
        $em->persist($member);
        $em->persist(object: $community);
        $em->flush();
        
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

        // Return updated member
        return $member;
    }

}