<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\Member;
use App\Entity\User;
use App\Repository\MemberRepository;
use App\Security\CommunityVoter;
use App\Service\UserService;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class BanController extends AbstractController
{

    // GET ONE SPECIFIC

    #[View(serializerGroups: ["member_ban"])]
    #[Route(path: '/communities/{communityId}/members/{userId}/ban-info', methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_MODERATE', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get the ban information about a user.",
        tags: ["Bans"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Member ban info',
                content: new OA\JsonContent( type: 'object', ref: "#/components/schemas/MemberBan")
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
    public function baninfo(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'userId')] User $user,
        MemberRepository $memberRepository,
        UserService $userService
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
        $userService->generateAvatarUrl($member->getUser());
      
        return $member;
    }


    // LIST


    #[View(serializerGroups: ["member_ban"])]
    #[Route(path:"/communities/{id}/banned-members", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_MODERATE', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get the list of banned users in a community",
        tags: ["Bans"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of members',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/MemberBan"))
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
    public function exiles(
        Community $community,
        MemberRepository $memberRepository,
        UserService $userService
    )
    {
        $members = $memberRepository->findBy([
            'community' => $community,
            'isBanned' => true
        ]);
        
        // Generate AvatarUrl
        foreach ($members as $member) {
            $userService->generateAvatarUrl($member->getUser());
        };

        return $members;
    }




    // BAN


    #[View(serializerGroups: ["member_ban"])]
    #[Route('/communities/{communityId}/members/{userId}/ban', methods: ["POST"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_MODERATE', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Post(
        summary: "Ban a user from a community",
        tags: ["Bans"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Member',
                content: new OA\JsonContent( type: 'object', ref: "#/components/schemas/MemberBan")
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
                description: 'Community or User not found',
            ),
        ]
    )] 
    public function ban(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'userId')] User $user,
        #[CurrentUser()] User $moderator,
        UserService $userService,
        EntityManagerInterface $em
        ) 
    {

        // Get the member
        $member = $em->getRepository(Member::class)->findOneBy([
            "user" => $user,
            "community" => $community,
            "isBanned" => false,
        ]);
        
        // Make sure member exist
        if ($member === null) {
            return throw new NotFoundHttpException("User not found in this community.");
        }

        // Make sure the user is not banning themselves
        if ($moderator === $user)
        {
            return throw new ConflictHttpException("You cannot ban yourself!");
        }

        // Make sure they are not banning someone higher ranked than them

        // Check for administratorship when banning a moderator
        if($member->getRole() === CommunityRoleEnum::MODERATOR){
            $this->denyAccessUnlessGranted(
                CommunityVoter::MANAGE_ROLES, 
                $community, 
                message:"You do not have permission to ban this user."
            );
        }

        // Check for ownership when banning an administrator
        if($member->getRole() === CommunityRoleEnum::ADMIN){
            $this->denyAccessUnlessGranted(
                CommunityVoter::MANAGE_ADMINS, 
                $community, 
                message:"You do not have permission to ban this user."
            );
        }

        // Ban
        $member
            ->setRole(CommunityRoleEnum::MEMBER)
            ->setIsBanned(true)
            ->setLastBannedAt(new \DateTimeImmutable())
            ->setLastBannedBy($moderator)
            ->incrementBanCount()
        ;

        // Save
        $em->persist($member);
        $em->flush();

        // Generate AvatarUrl
        $userService->generateAvatarUrl($member->getUser());
      
        // Return
        return $member;
    }

    /*
    #[Route('/communities/{communityId}/members/{userId}/unban')]
    public function unban()
    {
    }*/
}
