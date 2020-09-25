// @ts-check
/*
 * From http://www.redblobgames.com/maps/mapgen2/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 * License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { mix } from './util.js';

/**
 * @param {any} ocean
 * @param {any} water
 * @param {any} coast
 * @param {number} temperature
 * @param {number} moisture
 * @returns {string}
 */
function biome(ocean, water, coast, temperature, moisture) {
    if (ocean) {
        return 'OCEAN';
    } else if (water) {
        if (temperature > 0.9) return 'MARSH';
        if (temperature < 0.2) return 'ICE';
        return 'LAKE';
    } else if (coast) {
        return 'BEACH';
    } else if (temperature < 0.2) {
        if (moisture > 0.50) return 'SNOW';
        else if (moisture > 0.33) return 'TUNDRA';
        else if (moisture > 0.16) return 'BARE';
        else return 'SCORCHED';
    } else if (temperature < 0.4) {
        if (moisture > 0.66) return 'TAIGA';
        else if (moisture > 0.33) return 'SHRUBLAND';
        else return 'TEMPERATE_DESERT';
    } else if (temperature < 0.7) {
        if (moisture > 0.83) return 'TEMPERATE_RAIN_FOREST';
        else if (moisture > 0.50) return 'TEMPERATE_DECIDUOUS_FOREST';
        else if (moisture > 0.16) return 'GRASSLAND';
        else return 'TEMPERATE_DESERT';
    } else {
        if (moisture > 0.66) return 'TROPICAL_RAIN_FOREST';
        else if (moisture > 0.33) return 'TROPICAL_SEASONAL_FOREST';
        else if (moisture > 0.16) return 'GRASSLAND';
        else return 'SUBTROPICAL_DESERT';
    }
}


/**
 * A coast region is land that has an ocean neighbor
 */
export const assign_r_coast = /**
 * @param {boolean[]} r_coast
 * @param {{ numRegions: number; r_circulate_r: (arg0: any[], arg1: number) => void; }} mesh
 * @param {any[]} r_ocean
 */
 function(r_coast, mesh, r_ocean) {
    r_coast.length = mesh.numRegions;
    r_coast.fill(false);
    
    let out_r = [];
    for (let r1 = 0; r1 < mesh.numRegions; r1++) {
        mesh.r_circulate_r(out_r, r1);
        if (!r_ocean[r1]) {
            for (let r2 of out_r) {
                if (r_ocean[r2]) {
                    r_coast[r1] = true;
                    break;
                }
            }
        }
    }
    return r_coast;
};


/**
 * Temperature assignment
 *
 * Temperature is based on elevation and latitude.
 * The normal range is 0.0=cold, 1.0=hot, but it is not 
 * limited to that range, especially when using temperature bias.
 *
 * The northernmost parts of the map get bias_north added to them;
 * the southernmost get bias_south added; in between it's a blend.
 */
export const assign_r_temperature = /**
 * @param {number[]} r_temperature
 * @param {{ numRegions: number; r_y: (arg0: number) => number; }} mesh
 * @param {any} r_ocean
 * @param {any} r_water
 * @param {number[]} r_elevation
 * @param {any} r_moisture
 * @param {any} bias_north
 * @param {any} bias_south
 */
 function(
    r_temperature,
    mesh,
    r_ocean, r_water,
    r_elevation, r_moisture,
    bias_north, bias_south
) {
    r_temperature.length = mesh.numRegions;
    for (let r = 0; r < mesh.numRegions; r++) {
        let latitude = mesh.r_y(r) / 1000; /* 0.0 - 1.0 */
        let d_temperature = mix(bias_north, bias_south, latitude);
        r_temperature[r] = 1.0 - r_elevation[r] + d_temperature;
    }
    return r_temperature;
};


/**
 * Biomes assignment -- see the biome() function above
 */
export const assign_r_biome = /**
 * @param {string[]} r_biome
 * @param {{ numRegions: number; }} mesh
 * @param {any[]} r_ocean
 * @param {any[]} r_water
 * @param {any[]} r_coast
 * @param {any[]} r_temperature
 * @param {any[]} r_moisture
 */
 function(
    r_biome,
    mesh,
    r_ocean, r_water, r_coast, r_temperature, r_moisture
) {
    r_biome.length = mesh.numRegions;
    for (let r = 0; r < mesh.numRegions; r++) {
        r_biome[r] = biome(r_ocean[r], r_water[r], r_coast[r],
                           r_temperature[r], r_moisture[r]);
    }
    return r_biome;
};
