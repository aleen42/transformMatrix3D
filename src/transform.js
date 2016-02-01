/***********************************************************************
 *                                                                   _
 *       _____  _                           ____  _                 |_|
 *      |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *      | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *      |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *      |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_| 
 *                                                                      
 *      ================================================================
 *                 More than a coder, More than a designer              
 *      ================================================================
 *
 *
 *      - Document: transform.js
 *      - Author: aleen42
 *      - Description: include the function of transforming algorithmn
 *      - Create Time: Jan 25, 2015
 *      - Update Time: Jan 25, 2015 
 *
 *
 **********************************************************************/

"use strict";

/**
 * [transformObj: an obj to transform 4 points to responsitive 16 values of css-transform Matrix3D]
 * @type {Object}
 */
const transformObj = {
	/**
	 * [init: init function of transform obj]
	 * @return {[type]} [description]
	 */
	init: function (originPointArray) {
        "use strict";
		/**
		 * [_originPoints: the based point of the image]
		 * @type {Array}
		 */
		this._originPoints = originPointArray;

        /**
         * [calWidth: calculated width]
         * @type {Number}
         */
        this._calWidth = 0.0;
        
        /**
         * [calHeight: calculated height]
         * @type {Number}
         */
        this._calHeight = 0.0;
	},

	/**
	 * [transformToMatrix: calculate the 4*4 matrix according to current points]
	 * @param  {[type]} points [the array of current points]
	 * @return {[type]}        [description]
	 */
	transformToMatrix: function (points) {
        "use strict";
		let A, H, b, h, i, k, k_i, l, lhs, m, ref, rhs;
        A = [];
        for (i = k = 0; k < 4; i = ++k) {
            A.push([
                this._originPoints[i].x,
                this._originPoints[i].y,
                1,
                0,
                0,
                0,
                -this._originPoints[i].x * points[i].x,
                -this._originPoints[i].y * points[i].x
            ]);

            A.push([
                0,
                0,
                0,
                this._originPoints[i].x,
                this._originPoints[i].y,
                1,
                -this._originPoints[i].x * points[i].y,
                -this._originPoints[i].y * points[i].y
            ]);
        }

        b = [];
        for (i = l = 0; l < 4; i = ++l) {
            b.push(points[i].x);
            b.push(points[i].y);
        }

        h = numeric.solve(A, b);
        H = [
        		[h[0], h[1], 0, h[2]],
            	[h[3], h[4], 0, h[5]],
            	[0, 0, 1, 0],
            	[h[6], h[7], 0, 1]
        ];

        for (i = m = 0; m < 4; i = ++m) {
            lhs = numeric.dot(H, [
                this._originPoints[i].x,
                this._originPoints[i].y,
                0,
                1
            ]);
            k_i = lhs[3];
            rhs = numeric.dot(k_i, [
                points[i].x,
                points[i].y,
                0,
                1
            ]);
        }
        return H;
	},

    /**
     * [setObj: set css attrs for an obj]
     * @param {[type]} obj        [the obj]
     * @param {[type]} destPoints [the destination points array]
     */
    setObj: function (obj, destPoints, objWidth, objHeight) {
        "use strict";

        const transformData = 'matrix3d(' + function () {
            "use strict";
            let i, k, H, results;
            results = [];
            H = transformObj.transformToMatrix(destPoints);

            transformObj._calWidth = transformObj._calWidth == 0 ? objWidth : transformObj._calWidth;
            transformObj._calHeight = transformObj._calHeight == 0 ? objHeight : transformObj._calHeight;

            for (i = k = 0; k < 4; i = ++k) {
                results.push(function () {
                    let l, j, results1;
                    results1 = [];

                    for (j = l = 0; l < 4; j = ++l) {
                        results1.push(H[j][i].toFixed(20));
                    }

                    return results1;
                }());
            }

            return results;
        }().join(',') + ')';

        obj.css({
            'width': transformObj._calWidth.toFixed(6) + 'px',
            'height': transformObj._calHeight.toFixed(6) + 'px',
            'transform': transformData,
            '-webkit-transform': transformData,
            '-ms-transform': transformData,
            '-moz-transform': transformData,
            '-o-transform': transformData,
            'transform-origin': '0 0',
            '-webkit-transform-origin': '0 0',
            '-ms-transform-origin': '0 0',
            '-moz-transform-origin': '0 0',
            '-o-transform-origin': '0 0'
        });
        // obj.setAttribute('style', '-webkit-transform: ' + transformData + '; -webkit-transform-origin: 0 0;');
    }
};

/**
 * [canvasTransformObj: an obj to transform 4 points to set the position of an image with canvas]
 * @type {Object}
 */
const canvasTransformObj = {
    /**
     * [init: init func of this obj]
     * @param  {[type]} canvasObj [the canvas]
     * @return {[type]}           [description]
     */
    init: function (canvasObj, srcImage, width, height) {
        this._width = width;
        this._height = height;
        this._srcImage = srcImage;
        this._subdivisionLimit = 5;
        this._patchSize = 32;
        this._canvas = canvasObj;
        this._ctx = null;
    },

    /**
     * [getProjectiveTransform: Calculate a projective transform that maps [0,1]x[0,1] onto the given set of points]
     * @param  {[type]} points [the 4 points]
     * @return {[type]}        [description]
     */
    getProjectiveTransform: function (points) {
        const eqMatrix = new Matrix(9, 8, [
            [ 1, 1, 1, 0, 0, 0, -points[3].x, -points[3].x, -points[3].x],
            [ 0, 1, 1, 0, 0, 0, 0, -points[2].x, -points[2].x],
            [ 1, 0, 1, 0, 0, 0, -points[1].x, 0, -points[1].x],
            [ 0, 0, 1, 0, 0, 0, 0, 0, -points[0].x],

            [ 0, 0, 0, -1, -1, -1, points[3].y, points[3].y, points[3].y],
            [ 0, 0, 0, 0, -1, -1, 0, points[2].y, points[2].y],
            [ 0, 0, 0, -1, 0, -1, points[1].y, 0, points[1].y],
            [ 0, 0, 0, 0, 0, -1, 0, 0, points[0].y]

        ]);

        const kernel = eqMatrix.rowEchelon().values;
        const transform = new Matrix(3, 3, [
            [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
            [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
            [-kernel[6][8], -kernel[7][8], 1]
        ]);
        return transform;
    },

    /**
     * [divide: Render a projective patch]
     * @param  {[type]} u1    [description]
     * @param  {[type]} v1    [description]
     * @param  {[type]} u4    [description]
     * @param  {[type]} v4    [description]
     * @param  {[type]} p1    [description]
     * @param  {[type]} p2    [description]
     * @param  {[type]} p3    [description]
     * @param  {[type]} p4    [description]
     * @param  {[type]} limit [description]
     * @return {[type]}       [description]
     */
    divide: function (u1, v1, u4, v4, p1, p2, p3, p4, limit) {
        "use strict";
        const transform = this.getProjectiveTransform(this._points);

        /** See if we can still divide */
        if (limit) {
            /** Measure patch non-affinity */
            let d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
            let d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
            let d3 = [d1[0] + d2[0], d1[1] + d2[1]];
            let r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

            /** Measure patch area */
            d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
            d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
            
            const area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

            /** Check area > patchSize pixels (note factor 4 due to not averaging d1 and d2) */
            /** The non-affinity measure is used as a correction factor */
            if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this._patchSize * this._patchSize))) {
                /** Calculate subdivision points (middle, top, bottom, left, right) */
                const umid = (u1 + u4) / 2;
                const vmid = (v1 + v4) / 2;
                const pmid = transform.transformProjectiveVector([umid, vmid, 1]);
                const pt = transform.transformProjectiveVector([umid, v1, 1]);
                const pb = transform.transformProjectiveVector([umid, v4, 1]);
                const pl = transform.transformProjectiveVector([u1, vmid, 1]);
                const pr = transform.transformProjectiveVector([u4, vmid, 1]);

                // Subdivide.
                limit--;
                this.divide(u1, v1, umid, vmid, p1, pt, pl, pmid, limit);
                this.divide(umid, v1, u4, vmid, pt, p2, pmid, pr, limit);
                this.divide(u1, vmid, umid, v4, pl, pmid, p3, pb, limit);
                this.divide(umid, vmid, u4, v4, pmid, pr, pb, p4, limit);

                return;
            }
        }

        /** Render this patch */
        this._ctx.save();

        /** Set clipping path */
        this._ctx.beginPath();
        this._ctx.moveTo(p1[0], p1[1]);
        this._ctx.lineTo(p2[0], p2[1]);
        this._ctx.lineTo(p4[0], p4[1]);
        this._ctx.lineTo(p3[0], p3[1]);
        this._ctx.closePath();

        /** Get patch edge vectors */
        const d12 = [p2[0] - p1[0], p2[1] - p1[1]];
        const d24 = [p4[0] - p2[0], p4[1] - p2[1]];
        const d43 = [p3[0] - p4[0], p3[1] - p4[1]];
        const d31 = [p1[0] - p3[0], p1[1] - p3[1]];

        /** Find the corner that encloses the most area */
        const a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
        const a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
        const a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
        const a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
        const amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
        
        let dx = 0
        let dy = 0
        let padx = 0
        let pady = 0;

        /** Align the transform along this corner */
        switch (amax) {
            case a1:
                this._ctx.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
                /** Calculate 1.05 pixel padding on vector basis */
                if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
                break;
            case a2:
                this._ctx.transform(d12[0], d12[1], d24[0], d24[1], p2[0], p2[1]);
                /** Calculate 1.05 pixel padding on vector basis */
                if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
                dx = -1;
                break;
            case a4:
                this._ctx.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
                /** Calculate 1.05 pixel padding on vector basis */
                if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
                dx = -1;
                dy = -1;
                break;
            case a3:
                /** Calculate 1.05 pixel padding on vector basis */
                this._ctx.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
                if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
                dy = -1;
                break;
        }

        /** Calculate image padding to match */
        const du = (u4 - u1);
        const dv = (v4 - v1);
        const padu = padx * du;
        const padv = pady * dv;

        const iw = this._srcImage.width;
        const ih = this._srcImage.height;

        this._ctx.drawImage(this._srcImage, u1 * iw, v1 * ih, Math.min(u4 - u1 + padu, 1) * iw, Math.min(v4 - v1 + padv, 1) * ih, dx, dy, 1 + padx, 1 + pady);
        this._ctx.restore();
    },

    /**
     * [stretchImage: draw Image to the canvas according to 4 points]
     * @param  {[type]} points    [the 4 points]
     * @return {[type]}           [description]
     */
    stretchImage: function(points) {
        "use strict";
        /** Reshape canvas */
        this._canvas.style.left = '0px';
        this._canvas.style.top = '0px';
        this._canvas.width = this._width;
        this._canvas.height = this._height;

        /** new the canvas */
        this._ctx = this._canvas.getContext('2d');

        /** clear the canvas */
        this._ctx.clearRect(0, 0, this._width, this._height);

        /** init points data */
        this._points = points;

        const transform = this.getProjectiveTransform(this._points);

        /** Begin subdivision process */
        const ptl = transform.transformProjectiveVector([0, 0, 1]);
        const ptr = transform.transformProjectiveVector([1, 0, 1]);
        const pbl = transform.transformProjectiveVector([0, 1, 1]);
        const pbr = transform.transformProjectiveVector([1, 1, 1]);

        this._ctx.beginPath();
        this._ctx.moveTo(ptl[0], ptl[1]);
        this._ctx.lineTo(ptr[0], ptr[1]);
        this._ctx.lineTo(pbr[0], pbr[1]);
        this._ctx.lineTo(pbl[0], pbl[1]);
        this._ctx.closePath();
        this._ctx.clip();

        this.divide(0, 0, 1, 1, ptl, ptr, pbl, pbr, this._subdivisionLimit);
    }
};
