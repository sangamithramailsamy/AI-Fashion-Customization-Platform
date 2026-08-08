import apiClient from "./apiClient";

export interface CustomDesignRequest {
  id: number;
  customer: number;
  occasion: string;
  description: string;
  colors: string;
  fabric: string;
  silhouette: string;
  inspiration_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomDesignData {
  occasion: string;
  description: string;
  colors: string;
  fabric: string;
  silhouette: string;
  inspiration_image?: File | null;
}

export const customDesignService = {
  async create(
    data: CreateCustomDesignData
  ): Promise<CustomDesignRequest> {
    const formData = new FormData();

    formData.append("occasion", data.occasion);
    formData.append("description", data.description);
    formData.append("colors", data.colors);
    formData.append("fabric", data.fabric);
    formData.append("silhouette", data.silhouette);

    if (data.inspiration_image) {
      formData.append(
        "inspiration_image",
        data.inspiration_image
      );
    }

    const res = await apiClient.post(
      "/custom-designs/",
      formData,
    );

    return res.data;
  },

  async list(): Promise<CustomDesignRequest[]> {
    const res = await apiClient.get("/custom-designs/");
    return res.data;
  },

  async get(id: number): Promise<CustomDesignRequest> {
    const res = await apiClient.get(`/custom-designs/${id}/`);
    return res.data;
  },
};