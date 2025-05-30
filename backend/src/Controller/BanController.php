<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\User;
use App\Repository\MemberRepository;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class BanController extends AbstractController
{
    #[View(serializerGroups: ["member_basic","member_ban"])]
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

    /*
    #[Route('/communities/{communityId}/members/{userId}/ban')]
    public function ban() 
    {
    }

    #[Route('/communities/{communityId}/members/{userId}/unban')]
    public function unban()
    {
    }*/
}
