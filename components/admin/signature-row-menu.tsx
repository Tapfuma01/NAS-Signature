"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildInstallShareMessage, mailtoShareUrl, whatsappShareUrl } from "@/lib/share-message";
import type { SignatureRow } from "@/types/signature-row";
import {
  canMutateSignatures,
  canUseDesignEditor,
  type AdminRole,
} from "@/lib/auth/roles";
import {
  Copy,
  Eye,
  LayoutTemplate,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

type Props = {
  row: SignatureRow;
  role: AdminRole;
  publicUrl: string;
  onEdit: () => void;
  onPreview: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
};

export function SignatureRowMenu({
  row,
  role,
  publicUrl,
  onEdit,
  onPreview,
  onCopyLink,
  onDelete,
}: Props) {
  const canEdit = canMutateSignatures(role);
  const canDesign = canUseDesignEditor(role);
  const shareMessage = buildInstallShareMessage(row.name, publicUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
        aria-label={`Actions for ${row.name}`}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{row.name}</DropdownMenuLabel>
          <DropdownMenuItem onClick={onPreview}>
            <Eye className="size-4" />
            Preview signature
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyLink}>
            <Copy className="size-4" />
            Copy public link
          </DropdownMenuItem>
          {canEdit ? (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit member
            </DropdownMenuItem>
          ) : null}
          {canDesign ? (
            <DropdownMenuItem
              onClick={() => {
                window.location.href = `/admin/templates/${row.template_id}/edit`;
              }}
            >
              <LayoutTemplate className="size-4" />
              Edit template design
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Share</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              window.open(whatsappShareUrl(shareMessage), "_blank", "noopener,noreferrer")
            }
          >
            <MessageCircle className="size-4" />
            Send via WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { window.location.href = mailtoShareUrl(shareMessage); }}>
            <Mail className="size-4" />
            Send via email
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {canEdit ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
