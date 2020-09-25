// @ts-check
/*
 * From http://www.redblobgames.com/maps/mapgen2/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { randomShuffle } from './util.js';
import { assign_r_water, assign_r_ocean } from './water.js';
import { assign_t_elevation, redistribute_t_elevation, assign_r_elevation } from './elevation.js';
import { find_spring_t, assign_s_flow } from './rivers.js';
import { assign_r_moisture, find_moisture_seeds_r, redistribute_r_moisture } from './moisture.js';
import { assign_r_coast, assign_r_temperature, assign_r_biome } from './biomes.js';
import { assign_s_segments } from './noisy-edges.js';

/**
 * Map generator
 *
 * Map coordinates are 0 ≤ x ≤ 1000, 0 ≤ y ≤ 1000.
 *
 * mesh: DualMesh
 * noisyEdgeOptions: {length, amplitude, seed}
 * makeRandInt: function(seed) -> function(N) -> an int from 0 to N-1
 */
class Map {
    /**
     * @param {any} mesh
     * @param {{ seed?: any; amplitude?: any; length?: any; }} noisyEdgeOptions
     * @param {any} makeRandInt
     */
    constructor(mesh, noisyEdgeOptions, makeRandInt) {
        this.mesh = mesh;
        this.makeRandInt = makeRandInt;
        this.s_lines = assign_s_segments(
            [],
            this.mesh,
            noisyEdgeOptions,
            this.makeRandInt(noisyEdgeOptions.seed)
        );

        this.r_water = [];
        this.r_ocean = [];
        this.t_coastdistance = [];
        this.t_elevation = [];
        this.t_downslope_s = [];
        this.r_elevation = [];
        this.s_flow = [];
        this.r_waterdistance = [];
        this.r_moisture = [];
        this.r_coast = [];
        this.r_temperature = [];
        this.r_biome = [];
    }

 
    /**
     * @param {{ noise: any; shape: any; drainageSeed: any; riverSeed: any; numRivers: number; biomeBias: { moisture: number; north_temperature: any; south_temperature: any; }; }} options
     */
    calculate(options) {
        options = Object.assign({
            noise: null, // required: function(nx, ny) -> number from -1 to +1
            shape: {round: 0.5, inflate: 0.4, amplitudes: [1/2, 1/4, 1/8, 1/16]},
            numRivers: 30,
            drainageSeed: 0,
            riverSeed: 0,
            noisyEdge: {length: 10, amplitude: 0.2, seed: 0},
            biomeBias: {north_temperature: 0, south_temperature: 0, moisture: 0},
        }, options);

        assign_r_water(this.r_water, this.mesh, options.noise, options.shape);
        assign_r_ocean(this.r_ocean, this.mesh, this.r_water);
        
        assign_t_elevation(
            this.t_elevation, this.t_coastdistance, this.t_downslope_s,
            this.mesh,
            this.r_ocean, this.r_water, this.makeRandInt(options.drainageSeed)
        );
        redistribute_t_elevation(this.t_elevation, this.mesh);
        // @ts-ignore
        assign_r_elevation(this.r_elevation, this.mesh, this.t_elevation, this.r_ocean);

        this.spring_t = find_spring_t(this.mesh, this.r_water, this.t_elevation, this.t_downslope_s);
        randomShuffle(this.spring_t, this.makeRandInt(options.riverSeed));
        
        this.river_t = this.spring_t.slice(0, options.numRivers);
        assign_s_flow(this.s_flow, this.mesh, this.t_downslope_s, this.river_t );
        
        assign_r_moisture(
            this.r_moisture, this.r_waterdistance,
            this.mesh,
            this.r_water, find_moisture_seeds_r(this.mesh, this.s_flow, this.r_ocean, this.r_water)
        );
        redistribute_r_moisture(this.r_moisture, this.mesh, this.r_water,
                                         options.biomeBias.moisture, 1 + options.biomeBias.moisture);

        assign_r_coast(this.r_coast, this.mesh, this.r_ocean);
        assign_r_temperature(
            this.r_temperature,
            this.mesh,
            this.r_ocean, this.r_water, this.r_elevation, this.r_moisture,
            options.biomeBias.north_temperature, options.biomeBias.south_temperature
        );
        assign_r_biome(
            this.r_biome,
            this.mesh,
            this.r_ocean, this.r_water, this.r_coast, this.r_temperature, this.r_moisture
        );
    }
}

export default Map;
