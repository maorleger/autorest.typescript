/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  CommunityGalleryImagesGetOptionalParams,
  CommunityGalleryImagesGetResponse,
} from "../models/index.js";

/** Interface representing a CommunityGalleryImages. */
export interface CommunityGalleryImages {
  /**
   * Get a community gallery image.
   * @param location Resource location.
   * @param publicGalleryName The public name of the community gallery.
   * @param galleryImageName The name of the community gallery image definition.
   * @param options The options parameters.
   */
  get(
    location: string,
    publicGalleryName: string,
    galleryImageName: string,
    options?: CommunityGalleryImagesGetOptionalParams,
  ): Promise<CommunityGalleryImagesGetResponse>;
}
