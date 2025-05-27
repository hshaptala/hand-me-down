<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\Item;
use App\Repository\ItemRepository;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class ItemController extends AbstractController
{
   
    // List

    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/communities/{id}/items", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get all the items of a community.",
        tags: ["Items"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of items',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: new Model(type: Item::class, groups: ['item_basic'])))
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
        ItemRepository $itemRepository,
        UrlGeneratorInterface $urlGen
    )
    {
        $items = $itemRepository->findByCommunity($community);
        
        /* Generate image urls
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
        };*/

        return $items;
    }
}
