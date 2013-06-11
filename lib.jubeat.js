/*
 * 	       __      __               __     ________               __             ____  __                     
 *	      / /_  __/ /_  ___  ____ _/ /_   / ____/ /_  ____ ____  / /_  ____     / __ \/ /___ ___  _____  _____
 *	 __  / / / / / __ \/ _ \/ __ `/ __/  / /   / __ \/ __ `/ _ \/ __ \/ __ \   / /_/ / / __ `/ / / / _ \/ ___/
 *	/ /_/ / /_/ / /_/ /  __/ /_/ / /_   / /___/ / / / /_/ /  __/ /_/ / /_/ /  / ____/ / /_/ / /_/ /  __/ /    
 *	\____/\__,_/_.___/\___/\__,_/\__/   \____/_/ /_/\__,_/\___/_.___/\____/  /_/   /_/\__,_/\__, /\___/_/     
 *	                                                                                       /____/             
 * 
 * (c) Previrtu. "Jubeat", "유비트", and 'BEMANI" trademarks of Konami Digital Entertainment.
 * previrtu@isdev.kr | https://github.com/Previrtu
 *  
 * MIT LICENSE
 * http://opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2013 Previrtu.
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function() {
	// ECMAScript 5 Strict Mode
	"use strict";

	// Only Google Chrome
	if(window.chrome == undefined) {
		console.error('This applicsation only supported for Google Chrome.');
		return;
	}

	// Check jQuery Object
	if(window.jQuery == undefined) {
		console.error('Cannot find jQuery Object.');
		return;
	} else {
		// Bind jQuery
		if(window.$ == undefined)
			window.$ = window.jQuery;
	}

	var rand = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var map = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
	var toNote = function(n) {
		var result = [];

		for(var i = 0; i < 16; i++) {
			result.push((map[i] & n) == map[i] ? 1 : 0);
		}

		return result;
	}

	var printNote = function(n) {
		var code = [];

		for(var i = 0; i < 16; i += 4) {
			code.push([n[i], n[i + 1], n[i + 2], n[i + 3]].join(''));
		}

		console.log(code.join('\n'));
	}

	var jubeat = function() {
			this.chaebo = {};
			this.chaeboData = '';
			this.noteCount = {};
			this.noteBar = {};
			this.musicBar = [];
			this.mbSize = 0;
			this.combo = 0;
			this.last = '';

			this.started = false;
			this.playClap = true;
			
			this.soundManager = null;
			this.subSound = {};
			this.rootElement = null;
			this.child = null;
			this.childElement = [];
			this.comboElement = null;
			this.loadElement = null;
			this.mbElement = null;
			
			this.loadCount = 0;
	
			this.timer = [];
			this.mbTimer = null;
	
			this.configure = function(args) {
				if(!args.hasOwnProperty('rootElement')) {
					console.warn('Root element not setted.');
					return;
				}
				else if(!args.hasOwnProperty('loadElement')) {
					console.warn('Load element not setted.');
					return;
				}
				else if(!args.hasOwnProperty('comboElement')) {
					console.warn('Combo element not setted.');
					return;
				}

				this._setElement(args.rootElement);
				this._setLoadElement(args.loadElement);
				this._setComboElement(args.comboElement);
			};
	
			this._setElement = function(elem) {
				this.rootElement = elem;
	
				elem = $(elem);
				this.child = elem.find('li > div');
				for(var i = 1; i <= 16; i++) {
					this.childElement.push($(elem).find('li:nth-child(' + (i + '') + ') > div')[0]);
				};
	
				this.child.bind('webkitAnimationEnd animationend', function() {
					this.classList.remove('marker-shutter');
					this.style.borderColor = 'rgba(255,255,255,0.3)';
					this.style.borderWidth = '1px';
				});
			};
	
			this._setLoadElement = function(elem) {
				this.loadElement = elem;
			}

			this._setComboElement = function(elem) {
				this.comboElement = $(elem).find('span')[0];
				
				$(this.comboElement).bind('webkitAnimationEnd animationend', function() {
				 	this.classList.remove('release');
				});
			}
	
			this.loadChaebo = function(info, callback) {
				if(this.loadElement != null) this.loadElement.style.width = '5%';
				var root = this;
	
				$.ajax({
					type: 'GET',
					url: ['./chaebo/', info.name, '/', info.difficulty, '.csv'].join(''),
					cache: false,
					statusCode: {
						404: function() {
							alert('존재하지 않는 채보파일입니다.');
							return false;
						}
					},
					success: function(data) {
						if(root.loadElement != null) root.loadElement.style.width = '30%';
						root.chaeboData = data;
						root.loadSound(info, callback);
					}
				});
			};
	
			this.loadSound = function(info, callback) {
				var root = this;
				soundManager.setup({
					url: './soundmanager2/swf/',
					preferFlash: false,
					debugMode: false,
					useHighPerformance: true,
					onready: function() {
						root.soundManager = soundManager.createSound({
							url: ['./chaebo/', info.name, '/music.mp3'].join(''),
							autoLoad: true,
							onload: function() {
								root.loadCount++;
							}
						});
	
						root.subSound.clap = [];
						for(var i = 0; i < 16; i++) {
							root.subSound.clap.push(soundManager.createSound({
								url: './sound/clap.mp3',
								autoLoad: true,
								onload: function() {
									root.loadCount++;
									console.log('sound loaded', root.loadCount);
								}
							}));
						}

						var intv = setInterval(function() {
							if(root.loadCount == 17) {
								clearInterval(intv);
								if(root.loadElement != null) root.loadElement.style.width = '90%';
	
								callback(root.chaeboData);
								root.soundManager.play({
									volume: 80
								});
							}
						}, 100);
					}
				});
			}
	
			this.setMusicBar = function(duration) {
				var size = parseFloat((duration / 120).toFixed(2));
				var arr = []; arr[200] = null;
				var time_dic = {};
				for(var i = 0; i < 120; i++) {
					time_dic[i] = parseFloat(size * (i + 1).toFixed(2));
				}
	
				var i = 0;
				for(var noteTime in this.noteCount) {
					for(var dicNum in time_dic) {
						if(!arr[dicNum]) arr[dicNum] = 0;
	
						var start = 0;
						if(time_dic[dicNum] > 0) start = parseFloat(time_dic[dicNum]) - size;
	
						var ntime = parseFloat(noteTime);
						if(start < ntime && ntime < parseFloat(time_dic[dicNum])) {
							arr[dicNum] += this.noteCount[noteTime];
						}
						
						// Max MusicBar Limit: 8
						if(arr[dicNum] > 8) arr[dicNum] = 8;
					}
				}
	
				this.musicBar = arr;
				this.mbSize = size;

				// Garbage collection
				size = null;
				arr = null;
				time_dic = null;
				i = null;
			};
	
			this.drawMusicBar = function(element) {
				if(!this.musicBar || this.musicBar.length < 120) return;
				var mb = $(element);
	
				for(var i = 0; i < 120; i++) {
					var row = document.createElement('li');
					row.className = ['line l_', (i + 1) + ''].join('');
	
					for(var j = 0; j < 8 - this.musicBar[i]; j++) {
						var div = document.createElement('div');
						div.className = 'blank';
	
						var ico = document.createElement('i');
						div.appendChild(ico);
						row.appendChild(div);
					}
					for(var j = 0; j < this.musicBar[i]; j++) {
						var div = document.createElement('div');
						div.className = 'fill gray';
	
						var ico = document.createElement('i');
						div.appendChild(ico);
						row.appendChild(div);
					}
	
					mb.append(row);
				}

				this.mbElement = element;

				// Garbage collection
				mb = null;
			};

			this.redrawMusicBar = function(root) {
				var pos = root.soundManager.position;
				var calc = Math.round((pos / 1000) / root.mbSize);

				if(calc == 0) return;

				var elem = root.mbElement.getElementsByClassName(['l_', calc].join(''))[0].getElementsByClassName('fill');
				if(elem.length > 0) {
					for(var i = 0; i < elem.length; i++) {
						elem[i].classList.remove('gray');
						elem[i].classList.add('yellow');
					}
				}

				if(calc == 0) clearInterval(root.mbTimer);

				// Garbage collection
				pos = null;
				calc = null;
			}
	
			this.setChaebo = function(data, callback) {
				var timer = {};
				data = data.split('\n');
	
				for(var d in data) {
					var i = data[d];
	
					if(i.indexOf(',') != -1) {
						i = i.split(',');
						if(isNaN(parseInt(i[0]))) continue;
						timer[i[0]] = [];
	
						var nte = toNote(i[1]);
						for (var j = 0; j < 16; j++)
						{
							if (nte[j] == 1)
							{
								timer[i[0]].push(j + 1);
							}
						}
					}
				}
	
				for(var intv in timer) {
					var t = parseFloat((intv / 1000).toFixed(2));
					if(!this.noteCount[t]) this.noteCount[t] = 0;
	
					this.noteCount[t] = timer[intv].length;
				}
	
				this.chaebo = timer;

				// Garbage collection
				timer = null;

				this.setMusicBar(parseFloat((this.soundManager.duration / 1000).toFixed(2)));
				callback();
			};
	
			this.start = function() {
				for(var intv in this.chaebo) {
					var iv = intv;
					var time = iv - 450;
	
					this.timer.push(setTimeout(this.drawMarker, time, this, this.chaebo[intv], 450, intv));
				}
	
				this.mbTimer = setInterval(this.redrawMusicBar, 300, this);
				if(this.loadElement != null) this.loadElement.style.width = '100%';

				this.started = true;
				console.info('Start');
			};

			this.playClapSound = function() {
				for(var i = 0; i < 16; i++) {
					if(this.subSound.clap[i].playState == 1) continue;

					this.subSound.clap[i].play();
					console.info('Play clap - Object ID', i);
					break;
				}
			};
	
			this.drawMarker = function(root, num, sync) {
				if(root.last == num.join(',')) return;
				else root.last = num.join(',');
	
				var border = '';
				if(num.length > 1) {
					border = ['#', rand(155, 255).toString(16), rand(155, 255).toString(16), rand(155, 255).toString(16)].join('');
				}

				for(var i = 0; i < num.length; i++) {
					root.childElement[num[i] - 1].classList.add('marker-shutter');
					if(border != '') {
						root.childElement[num[i] - 1].style.borderColor = border;
						root.childElement[num[i] - 1].style.borderWidth = '5px';
					}
				}

				// Garbage collection
				border = null;
	
				setTimeout(function() {
					if(root.playClap == true) {
						root.playClapSound();
					}
	
					root.combo += num.length;
					if(root.comboElement != null) {
						root.comboElement.innerText = root.combo.toString();
						if(root.comboElement.classList.contains('release'))
							root.comboElement.classList.remove('release');
						root.comboElement.classList.add('release');
					}
				}, sync);
			};
		};

	window.jubeat = jubeat;
})();