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
 *      - Document: media.js
 *      - Author: aleen42
 *      - Description: the obj of media in
 *      - Create Time: Mar 28th, 2015
 *      - Update Time: Mar 28th, 2015 
 *
 *
 **********************************************************************/
/**
 * [mediain: an obj to control mediain technology]
 * @type {Object}
 */
var mediain = {
    /**
     * [_video: video player obj]
     * @type {[type]}
     */
    _video: null,

    /**
     * [videoFPS: fps of the video, which is 25 by default]
     * @type {Number}
     */
    _videoFPS: 25,

    /**
     * [transformInstances: an array to store transform instances]
     * @type {Array}
     */
    _transformInstances: [],

    /**
     * [timeTicks: time interval obj]
     * @type {Array}
     */
    _timeTicks: [],


    /**
     * [upLimitNum: limit count]
     * @type {Number}
     */
    _upLimitNum: 0,
	
    /**
     * [init: init function of mediain obj]
     * @param  {[type]} player [the video player]
     * @return {[type]}        [description]
     */
	init: function (player) {
		this._video = player;
	},

    /**
     * [initMedia: init all the media box]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    initMedia: function (callback) {
        this._video.on('canplay', callback);
    },

    /**
     * [initProgramedIO: loop to listen to update images of the obj]
     * @param  {[type]} obj     [the obj]
     * @param  {[type]} postUrl [the post url]
     * @param  {[type]} macAddr [the device mac addr]
     * @return {[type]}         [description]
     */
    initProgramedIO: function (obj, postUrl, macAddr) {
        /**
         * init the post addr
         */
        comet.init(postUrl);

        /** init post data */
        var postData = {
            masterMac: macAddr,
        };

        /** post and bind callback function */
        comet.subscribe(postData, function(data) {
            /** update image */
            if (obj.attr('srcUri') !== data.adUrl) {
                obj.css({ 'background-image': 'url(' + data.adUrl + ')' });
                obj.attr('srcUri', data.adUrl);
            }
            /** refresh to listen */
            comet._refresh();
        });

        /** start to listen */
        comet.run();
    },

    /**
     * [initBox: init each box to move]
     * @param  {[type]} path  [the path to the data]
     * @param  {[type]} obj   [the box obj]
     * @param  {[type]} index [which index]
     * @return {[type]}       [description]
     */
    initBox: function (path, obj, index) {
        var _this = this;
        $.getJSON(path, function (data) {
            /** optional stuff to do after success */
            var parseData = data[0].data;

            /** an array to store period of showing boxes */
            var dataPeriod = [];
            /** [for: to initiate the dataPeriod array] */
            for (var i = 0; i < data.length; i++) {
                dataPeriod.push(data[i].startFrame);
            }

            // var videoWidth = data.width;
            // var videoHeight = data.height;

            // $('#canvas-box').width(videoWidth);
            // $('#canvas-box').height(videoHeight);
            // $('#canvas-box').attr({
            //     'width': videoWidth,
            //     'height': videoHeight
            // });

            /** to store the number of frames */
            _this._upLimitNum = data[0].frames;

            /** to store the fps */
            _this._videoFPS = data[0].fps;

            /** get point A, B, C from the first frame to calculate the width and height of the logo */
            var x0 = parseData['A'][0].x;
            var y0 = parseData['A'][0].y;
            var x1 = parseData['C'][0].x;
            var y1 = parseData['C'][0].y;
            var x2 = parseData['B'][0].x;
            var y2 = parseData['B'][0].y;

            var logoWidth = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            var logoHeight = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));

            /** setup the origin points of the logo */
            var origin = [
                { x: 0, y: 0 },
                { x: 0, y: logoHeight },
                { x: logoWidth, y: 0 },
                { x: logoWidth, y: logoHeight }
            ];

            /** init the origin point */
            _this._transformInstances.push(Object.create(transformObj));
            _this._transformInstances[index].init(origin);

            /**
             * [dest: destination points array]
             * @type {[type]}
             */
            var dest = null;

            /**
             * [count: frames number]
             * @type {Number}
             */
            var count = 0;
            
            /** this parameter means the ratio of the size of the video player divided by the origin size of the video */
            var ratio = 1.0;

            // canvasTransformObj.stretchImage($('#imgSrc')[0], dest, $('#canvas-box')[0])
            _this._timeTicks.push(setInterval(function () {
                /** [if: update box when the video is ready] */
                if (_this._video[0].readyState !== 4) {
                    return;
                }

                /** to calculate the index of frames */
                count = Math.floor(_this._video[0].currentTime * _this._videoFPS);

                /** to calculate the current period */
                var currentDataPeriod = -1;
                for (var i = 0; i < dataPeriod.length; i++) {
                    if (count >= dataPeriod[i]) {
                        currentDataPeriod += 1;
                    }
                }

                /** to calculate current ratio */
                ratio = _this._video.width() / data[0].width;

                /** to calculate current data sets of points */
                if (typeof(data[currentDataPeriod]) == 'undefined') {
                    obj.hide();
                    return;
                } else {
                    obj.show();
                    parseData = data[currentDataPeriod].data;
                }

                /** to re-calculate the index */
                count -= data[currentDataPeriod].startFrame;

                /** clear array */
                dest = [];

                /** array order(canvas): left-top -> left-bottom -> right-top -> right-bottom */
                // var order = ['A', 'C', 'B', 'D'];
                /** array order(css): left-top -> right-top -> left-bottom -> right-bottom */
                var order = ['A', 'B', 'C', 'D'];

                /** [if: check whether frame number is over than the upper limit] */
                if (count >= _this._upLimitNum) {
                    /** ... */
                    obj.show();
                    count = 0;
                };

                /** [if: if outside video, then add the currentDataPeriod] */
                if (typeof(parseData[order[0]][count + 1]) == 'undefined') {
                    obj.hide();
                } else {
                    obj.show();
                }

                /** [for: loop to get dest points] */
                for (var i = 0; i < order.length; i++) {
                    var x = (typeof(parseData[order[i]][count]) != 'undefined') ? parseData[order[i]][count].x * ratio : 0;
                    var y = (typeof(parseData[order[i]][count]) != 'undefined') ? parseData[order[i]][count].y * ratio : 0;

                    dest.push({
                        x: x,
                        y: y
                    });
                }

                /** set attrs for the obj */
                _this._transformInstances[index].setObj(obj, dest, logoWidth, logoHeight);
                // canvasTransformObj.stretchImage(dest);
            }, 1));
        });
    },

    /**
     * [initData: init static check data]
     * @param  {[type]} path [the path to the data]
     * @param  {[type]} obj  [the box obj]
     * @return {[type]}      [description]
     */
    initData: function (path, obj) {
        var _this = this;

        $.getJSON(path, function(data) {
            /*optional stuff to do after success */
            var parseData = data.staticData;

            /** to store the number of frames */
            _this._upLimitNum = data.frames;

            /** to store the fps */
            _this._videoFPS = data.fps;

            /**
             * [count: frames number]
             * @type {Number}
             */
            var count = 0;

            setInterval(function () {
                /** [if: update box when the video is ready] */
                if (_this._video[0].readyState !== 4) {
                    return;
                }

                /** to calculate the index of frames */
                count = Math.floor(_this._video[0].currentTime * _this._videoFPS);

                /** [if: check whether frame number is over than the upper limit] */
                if (count >= _this._upLimitNum) {
                    /** ... */
                    count = 0;
                };


                /** set attrs for the obj */
                var literal = parseData[count].isStatic;

                if (typeof(parseData[count + 1]) == 'undefined') {
                    return;
                }

                if (literal == 'false') {
                    obj.css({
                        'color': '#fff'
                    });
                } else {
                    obj.css({
                        'color': '#333'
                    });
                }
            }, 1);
        });
    }
};
