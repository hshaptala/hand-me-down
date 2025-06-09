import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  reserveItem,
  cancelReserveItem,
  confirmReceiveItem,
} from "@/service/item.service";

type ActionType = "reserve" | "cancel" | "confirm";

interface ItemActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: ActionType;
  itemId: number;
  itemTitle: string;
  onSuccess?: () => void;
}

const actionConfig = {
  reserve: {
    title: "Reserve Item",
    description: "Are you sure you want to reserve this item?",
    buttonText: "Reserve Item",
    buttonVariant: "default" as const,
    loadingText: "Reserving...",
    successMessage: "Item reserved successfully!",
  },
  cancel: {
    title: "Cancel Reservation",
    description:
      "Are you sure you want to cancel your reservation for this item?",
    buttonText: "Cancel Reservation",
    buttonVariant: "destructive" as const,
    loadingText: "Canceling...",
    successMessage: "Reservation canceled successfully!",
  },
  confirm: {
    title: "Confirm Receipt",
    description:
      "Are you sure you want to confirm that you have received this item? This action cannot be undone.",
    buttonText: "Confirm Receipt",
    buttonVariant: "default" as const,
    loadingText: "Confirming...",
    successMessage: "Exchange confirmed successfully!",
  },
};

export default function ItemActionDialog({
  isOpen,
  onClose,
  action,
  itemId,
  itemTitle,
  onSuccess,
}: ItemActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = actionConfig[action];
  const handleAction = async () => {
    setIsLoading(true);
    try {
      switch (action) {
        case "reserve":
          await reserveItem(itemId);
          break;
        case "cancel":
          await cancelReserveItem(itemId);
          break;
        case "confirm":
          await confirmReceiveItem(itemId);
          break;
        default:
          throw new Error("Invalid action");
      }

      toast.success(config.successMessage);
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      console.error(`Error ${action}ing item:`, error);

      let errorMessage = "Something went wrong. Please try again.";

      const isAxiosError = (
        err: unknown,
      ): err is { response?: { status?: number } } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      if (isAxiosError(error) && error.response?.status === 409) {
        switch (action) {
          case "reserve":
            errorMessage = "This item is no longer available for reservation.";
            break;
          case "cancel":
            errorMessage = "This item is not currently reserved.";
            break;
          case "confirm":
            errorMessage = "This item is not in a reserved state.";
            break;
        }
      } else if (isAxiosError(error) && error.response?.status === 403) {
        switch (action) {
          case "reserve":
            errorMessage = "You don't have permission to reserve this item.";
            break;
          case "cancel":
            errorMessage =
              "You don't have permission to cancel this reservation.";
            break;
          case "confirm":
            errorMessage =
              "You don't have permission to confirm this exchange.";
            break;
        }
      } else if (isAxiosError(error) && error.response?.status === 404) {
        errorMessage = "Item not found.";
      } else if (isAxiosError(error) && error.response?.status === 401) {
        errorMessage = "Please log in to continue.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description}
            <br />
            <span className="font-medium">Item: {itemTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? config.loadingText : config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
