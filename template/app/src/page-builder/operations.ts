import type { Page, Component } from "wasp/entities";
import type { SavePage, GetPage, DeletePage, GetUserPages } from "wasp/server/operations";
import { HttpError } from "wasp/server";

export const savePage: SavePage<{
  id?: string;
  name: string;
  slug: string;
  componentTree: string | null;
}, Page> = async (args, context) => {
  const { id, name, slug, componentTree } = args;
  const user = context.user;

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new HttpError(400, "Slug must contain only lowercase letters, numbers, and hyphens");
  }

  if (id) {
    // Update existing page
    const existingPage = await context.entities.Page.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingPage) {
      throw new HttpError(404, "Page not found");
    }

    if (existingPage.userId !== user.id) {
      throw new HttpError(403, "Forbidden");
    }

    // Check if slug is taken by another page
    const slugConflict = await context.entities.Page.findFirst({
      where: {
        slug,
        id: { not: id },
        userId: user.id,
      },
    });

    if (slugConflict) {
      throw new HttpError(400, "Slug already in use");
    }

    const updatedPage = await context.entities.Page.update({
      where: { id },
      data: {
        name,
        slug,
        componentTree: componentTree || "",
        updatedAt: new Date(),
      },
    });

    return updatedPage;
  } else {
    // Create new page
    // Check if slug is taken
    const slugConflict = await context.entities.Page.findFirst({
      where: {
        slug,
        userId: user.id,
      },
    });

    if (slugConflict) {
      throw new HttpError(400, "Slug already in use");
    }

    const newPage = await context.entities.Page.create({
      data: {
        name,
        slug,
        componentTree: componentTree || "",
        userId: user.id,
        isPublished: false,
      },
    });

    return newPage;
  }
};

export const getPage: GetPage<{ id: string }, Page | null> = async (
  args,
  context
) => {
  const { id } = args;
  const user = context.user;

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const page = await context.entities.Page.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!page) {
    return null;
  }

  if (page.userId !== user.id && !user.isAdmin) {
    throw new HttpError(403, "Forbidden");
  }

  return page;
};

export const getUserPages: GetUserPages<{}, Page[]> = async (args, context) => {
  const user = context.user;

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const pages = await context.entities.Page.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return pages;
};

export const deletePage: DeletePage<{ id: string }, void> = async (
  args,
  context
) => {
  const { id } = args;
  const user = context.user;

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const page = await context.entities.Page.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!page) {
    throw new HttpError(404, "Page not found");
  }

  if (page.userId !== user.id && !user.isAdmin) {
    throw new HttpError(403, "Forbidden");
  }

  await context.entities.Page.delete({
    where: { id },
  });
};

