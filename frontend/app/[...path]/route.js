import { NextResponse } from "next/server";

const DJANGO_URL = process.env.DJANGO_API_URL;

const PREFIXES_AUTORISES = [
  "auth",
  "cuisine",
  "backstage",
  "ingredients",
  "suggestion",
  "recettes",
];

export const dynamic = "force-dynamic";

async function relayer(request, { params }) {
  const segments = (await params).path || [];

  if (!PREFIXES_AUTORISES.includes(segments[0])) {
    return NextResponse.json({ detail: "Non trouvé." }, { status: 404 });
  }

  const chemin = segments.join("/");
  const recherche = request.nextUrl.search;
  const urlCible = `${DJANGO_URL}/${chemin}/${recherche}`;

  const corpsBrut = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();

  const reponseDjango = await fetch(urlCible, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: corpsBrut,
    redirect: "manual",
  });

  const corpsReponse = await reponseDjango.text();

  const reponse = new NextResponse(corpsReponse, {
    status: reponseDjango.status,
    headers: {
      "Content-Type": reponseDjango.headers.get("content-type") || "application/json",
    },
  });

  const cookies = reponseDjango.headers.getSetCookie?.() || [];
  cookies.forEach((cookie) => {
    reponse.headers.append("Set-Cookie", cookie);
  });

  return reponse;
}

export {
  relayer as GET,
  relayer as POST,
  relayer as PUT,
  relayer as PATCH,
  relayer as DELETE,
};