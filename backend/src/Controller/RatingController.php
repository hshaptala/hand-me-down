<?php

namespace App\Controller;

use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\Rating;
use App\Entity\User;
use App\Repository\RatingRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route("/api")]
final class RatingController extends AbstractController
{
    // LEAVE A RATING
    #[View(serializerGroups: ["rating_basic"])]
    #[Route('/ratings', methods: ['POST'])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Post(
        tags: ['Ratings'],
        summary: 'Leave a review to another user you have worked with.',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Rating sent successfully',
                content: new OA\JsonContent(ref: "#/components/schemas/Rating")
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
                description: 'Already left a rating for this user, or rating yourself.',
            ),
            new OA\Response(
                response: 422,
                description: 'Rating must be between 1 and 5.',
            ),
        ]
    )]
    public function new(
        #[CurrentUser()] User $from,
        #[OA\Parameter(
            description: "Target user id",
            in: "query",
            required: true,
        )]
        #[MapQueryParameter()] ?int $userId,
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
        #[MapQueryParameter()] ?string $message,
        EntityManagerInterface $em
    ) {
        // Get user
        $to = $em->getRepository(User::class)->findOneBy(["id" => $userId]);
        // No user given
        if ($to === null) {
            return new JsonResponse("User not found.", 404);
        }

        // Leave a rating to yourself
        if ($from === $to) {
            return new JsonResponse("You can't leave a rating to yourself!", 409);
        }

        // Rating a restricted user
        if ($to->isRestricted()) {
            return new JsonResponse("User not found.", 404);
        }

        // Leave a rating to someone you've not exchanged with
        $itemRepository = $em->getRepository(Item::class);
        $items = array_merge(
            $itemRepository->findBy(
                [
                    "donor" => $to,
                    "receiver" => $from,
                    "status" => ItemStatusEnum::OVER
                ]
            ),
            $itemRepository->findBy(
                [
                    "donor" => $from,
                    "receiver" => $to,
                    "status" => ItemStatusEnum::OVER
                ]
            )
        );
        if (count($items) == 0) {
            return new JsonResponse("You have never donated nor received an item from this user.", 403);
        }

        // Wrong rating value
        if ($rating < 1 || $rating > 5) {
            return new JsonResponse("Rating must be between 1 and 5.", 422);
        }

        $newRating = new Rating();
        $newRating
            ->setUserRating($from)
            ->setUserRated($to)
            ->setGrade($rating)
            ->setMessage($message)
            ->setCreatedAt(new \DateTimeImmutable());
        $em->persist($newRating);
        $em->flush();
        return $newRating;
    }

    // LIST A USER'S RATINGS

    #[View(serializerGroups: ["rating_basic"])]
    #[Route(path: "/api/users/{id}/ratings", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Consult a user's ratings.",
        tags: ["Ratings"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of ratings received and given.',
                content: new OA\JsonContent(type: 'object', ref: "#/components/schemas/UserRatings")
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
        ]
    )]
    public function items(
        User $user,
        RatingRepository $ratingRepository,
    ) {
        if ($user->isRestricted()) {
            return new JsonResponse("User not found.", 404);
        }

        $ratingsGiven = $ratingRepository->findBy(["userRating" => $user]);
        $ratingsReceived = $ratingRepository->findBy(["userRated" => $user]);

        return [
            "given" => $ratingsGiven,
            "received" => $ratingsReceived
        ];
    }


    // GET a specific one

    #[View(serializerGroups: ["rating_basic"])]
    #[Route(path: "/api/ratings/{id}", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Consult a rating information.",
        tags: ["Ratings"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Rating object.',
                content: new OA\JsonContent(type: 'object', ref: "#/components/schemas/Rating")
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 404,
                description: 'Rating not found',
            ),
        ]
    )]
    public function rating(
        Rating $rating,
    ) {
        return $rating;
    }


    // GET one from user ids

    #[View(serializerGroups: ["rating_basic"])]
    #[Route(path: "/api/ratings", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name: "Bearer")]
    #[OA\Get(
        summary: "Consult a rating information.",
        tags: ["Ratings"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Rating object.',
                content: new OA\JsonContent(type: 'object', ref: "#/components/schemas/Rating")
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 404,
                description: 'Rating not found or User not found.',
            ),
        ]
    )]
    public function ratingFromUserIds(
        #[OA\Parameter(
            description: "Rating sender user id",
            in: "query",
            required: true,
        )]
        #[MapQueryParameter()] ?int $fromId,
        #[OA\Parameter(
            description: "Rating receiver user id",
            in: "query",
            required: true,
        )]
        #[MapQueryParameter()] ?int $toId,
        EntityManagerInterface $em
    ) {
        // Get repositories
        $userRepository = $em->getRepository(User::class);
        $ratingRepository = $em->getRepository(Rating::class);

        // Get users
        $from = $userRepository->findOneBy(["id" => $fromId]);
        $to = $userRepository->findOneBy(["id" => $toId]);

        // Check users
        if ($from === null || $from->isRestricted()) {
            return new JsonResponse("User not found: " . $fromId, 404);
        }
        if ($to === null ||  $to->isRestricted()) {
            return new JsonResponse("User not found: " . $toId, 404);
        }

        // Get rating
        $rating = $ratingRepository->findOneBy(
            [
                "userRating" => $from,
                "userRated" => $to
            ]
        );
        if ($rating === null) {
            return new JsonResponse("Rating not found for users: " . $fromId . " and " . $toId, 404);
        }

        return $rating;
    }
}
