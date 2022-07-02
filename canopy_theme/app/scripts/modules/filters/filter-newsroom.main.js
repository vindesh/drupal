'use strict';

/**
 * The module is created to handle newsroom filter
 * Author: Aaron Ding
 * Date:   Oct-12-2020
 *
 * Scenarios:
 * When user visits www.ukg.com/about-us/newsroom
 *    they should get all the results (top 10 visible) with all the filters options available.
 * When user visits www.ukg.com/about-us/newsroom?type=press-release&tag=retail&region=united-states
 *    they will get all the results by each filter value with 3 filter label indicating the current filters.
 * When user visits from english speaking countries they should see the region filter, otherwise the filter is hidden.
 * When user visits with a page querystring (n), newsroom will toggle (n+1) * 10 results (visible)
 *    and auto scroll to the (n * 10 + 1) result
 * When certain filters not giving any results, the "no result block" will display.
 *
 * Clear all logic:
 * A Clear all label is visible immediately after any filter is applied.
 *
 * Filter Click Event Logic:
 * Upon filter dropdown toggled, any click on the filter item will proceed:
 *
 * Trigger beforeFilter event:
 *    get all applied filter value (uk-active)
 *    toggle dropdown off
 * Trigger afterFilter event:
 *    reset filter labels / display no result block
 *    display clear all label
 *    apply pagination logic (not yet decided), could be infinite load
 *
 *
 *
 */

const $ = require('jquery');
const UIkit = require('uikit');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'filterNewsroom: Function Name: {0}, {1}::{2}';
const format = require('string-format');
const filterToggle = require('../filters/filter-toggle.main');

module.exports = class filterNewsroom {
  constructor($el) {
    log.debug('filterNewsroom Init');
    // Initialize some base variables
    this._loadMore = false;
    this.$filterLabelContainer = $('.ukg-filter-label-container', $el);
    this.$filterLabelWrapper = $('.ukg-filter-label-container > .ukg-filter-labels', $el);
    this.$noResultContainer = $('.ukg-filter-no-results-container', $el);
    this.$loadMoreButton = $('.ukg-view-load-more', $el);
    this.$el = $el;
    this._filterOptions = this.processFilterQueries();
    this._loadPage = 0;
    let that = this;
    that.preprocessFilters(that._filterOptions);
    that._loadPage = that._filterOptions.page;

    // The events from UIKit that automatically trigger based on the filter operations.
    // before filter is fires after dom is loaded and right before filter is triggered.
    // however, you can't set any params from here, the param had already been set
    // to set params, you will need to do it during the dom building process.
    UIkit.util.on(that.$el, 'beforeFilter', function (e) {
      log.debug(logFormat_debug.format('beforeFilter', 'fired: ', ''));
      log.debug(e);
      // reset all the dropdown state
      // get all the dropdown navs
      that.toggleAllFilterDropdownOff(that);
      that.resetPagination(that);
      that.$noResultContainer.attr('hidden', '');
    });
    // afterFilter events fire after the filtering is complete.
    UIkit.util.on(that.$el, 'afterFilter', function (e) {
      log.debug(logFormat_debug.format('afterFilter', 'fired: ', ''));
      log.debug(e);
      that.postprocessFilters(that, e);
      let results = $('.ukg-list-news-item:visible', that.$el);
      log.debug(logFormat_debug.format('afterFilter', 'check visible items: ', results.length));
      if (results.length > 0) {
        that.buildPagination(that, results);
      } else {
        // toggle the no result
        that.toggleNoResultContainer(that);
        // remove load more
        // that.$loadMoreButton.attr('hidden', '');
      }
    });
    UIkit.util.on(that.$loadMoreButton, 'inview', function () {
      log.debug(logFormat_debug.format('loadMore', 'should process with load more check ', ''));
      that.loadMore(that);
    });
  }


  /**
   * The functions to process all the incoming variables.
   * region:          <querystring>   querystring for region parameter.
   * type:            <querystring>   querystring for type parameter.
   * tag:             <querystring>   querystring for tag parameter.
   * page:            <querystring>   querystring for the current page.
   * anchor:          Not being used, reserved for later.
   *
   * @category Events
   */
  processFilterQueries() {
    let that = this;
    let options = {
      region: '',
      type: '',
      tag: '',
      page: 0,
      anchor: 0,
    };
    let _filterQueryRegion = helper.GetQueryStringParameterByName('region');
    if (_filterQueryRegion !== null && _filterQueryRegion !== '') {
      options.region = _filterQueryRegion;
    }
    let _filterQueryType = helper.GetQueryStringParameterByName('type');
    if (_filterQueryType !== null && _filterQueryType !== '') {
      options.type = _filterQueryType;
    }
    let _filterQueryTag = helper.GetQueryStringParameterByName('tag');
    if (_filterQueryTag !== null && _filterQueryTag !== '') {
      options.tag = that.decode(_filterQueryTag).replace(/'/g, "&#039;");
    }
    let _filterCurrentPage = helper.GetQueryStringParameterByName('page');
    if (_filterCurrentPage !== null && _filterCurrentPage !== '') {
      options.anchor = options.page = parseInt(_filterCurrentPage);
    }
    return options;
  }

  /**
   * The functions to process all the filter values in the dropdown
   * region:          <querystring>   querystring for region parameter.
   * type:            <querystring>   querystring for type parameter.
   * tag:             <querystring>   querystring for tag parameter.
   *
   */
  processFilterValues(that, e) {
    let options = {
      region: '',
      type: '',
      tag: '',
    };
    let $regionFilters = $('.ukg-dropdown-filter #region', that.$el);
    if ($regionFilters.length > 0 && $regionFilters.find('li.uk-active').length > 0) {
      options.region = $regionFilters.find('li.uk-active > a.ukg-dropdown-link').text().toLowerCase().replace(/\s+/g, '-');
    }
    let $categoryFilters = $('.ukg-dropdown-filter #tag', that.$el);
    if ($categoryFilters.length > 0 && $categoryFilters.find('li.uk-active').length > 0) {
      options.tag = $categoryFilters.find('li.uk-active > a.ukg-dropdown-link').text().toLowerCase().replace(/\s+/g, '-');
    }
    let $typeFilters = $('.ukg-dropdown-filter #type', that.$el);
    if ($typeFilters.length > 0 && $typeFilters.find('li.uk-active').length > 0) {
      options.type = $typeFilters.find('li.uk-active > a.ukg-dropdown-link').text().toLowerCase().replace(/\s+/g, '-');
    }
    return options;
  }

  preprocessFilters(filterOptions) {
    let that = this;
    let _filterOptions = filterOptions;
    log.debug(logFormat_debug.format('preprocessFilters', 'getting the filter options: ', ''));
    // if filter Options is not empty, we build the filter labels
    log.debug(_filterOptions);
    // depending what's in the url, we toggle the active filter in the dropdown.
    Object.keys(_filterOptions).forEach(key => {
      let $filterTarget = that.getFilterTargetByValue(key, _filterOptions[key]);
      if ($filterTarget) {
        $filterTarget.parent().addClass('uk-active');
      } else {
        log.debug(logFormat_debug.format('preprocessFilters', 'filter option does not exist'));
      }
    });
  }

  postprocessFilters(that, e) {
    log.debug(logFormat_debug.format('postprocessFilters', 'start: ', ''));
    let _filterOptions = that.processFilterValues(that, e);
    log.debug(_filterOptions);
    // let $labels = that.setFilterLabels(_filterOptions);
    let displayFilterContainer = false;
    Object.keys(_filterOptions).forEach(key => {
      let $filter = $(`a.filter-${key}`, that.$filterLabelWrapper);
      log.debug($filter);
      if (_filterOptions[key]) {
        // Update the filter
        let filterText = '';
        let $filterTarget = that.getFilterTargetByValue(key, _filterOptions[key]);
        if ($filterTarget) {
          filterText = $filterTarget.text();
        }
        $filter.text(filterText);
        $filter.removeAttr('hidden');
        displayFilterContainer = true;
        that.updateURL(key, _filterOptions[key]);
        // Display the filter
      } else {
        // Update the filter to all
        // Hide the filter
        that.updateURL(key);
        $filter.text('');
        $filter.attr('hidden', '');
      }
    });
    if (displayFilterContainer) {
      that.$filterLabelContainer.removeAttr('hidden');
    } else {
      that.$filterLabelContainer.attr('hidden', '');
    }
  }

  buildPagination(that, results) {
    // get all the filtered result by visibility
    if (results.length > 10) {
      let maxPage = 0;
      if (that._loadPage > 0) {
        that._filterOptions.page = that._loadPage;
        that._loadPage = 0;
      }
      for (let i = 0; i < results.length; i++) {
        let _page = Math.floor(i / 10);
        let _currentPage = 'page-' + _page;
        if (_page > maxPage) {
          // build a page divider
          let $divider = $('<hr>', {
            attr: {
              class: 'uk-divider-icon uk-divider-pager uk-divider-' + _currentPage,
              hidden: '',
            },
            text: _page,
          });
          $divider.insertBefore(results[i]);
          maxPage = _page;
        }
        log.debug(logFormat_debug.format('buildPagination', 'result should be in: ', _currentPage));
        $(results[i]).attr('data-page', _currentPage);
        if (_page > that._filterOptions.page) {
          $(results[i]).addClass('uk-pager-inactive');
          that._loadMore = true;
        }
      }
      that.$loadMoreButton.attr('data-max-page', maxPage)
      // scroll down to the result if needed
      if (that._filterOptions.page > 0) {
        let scrollToPage, maxScrollPage = parseInt(that.$loadMoreButton.attr('data-max-page'));
        if (that._filterOptions.page <= maxScrollPage) {
          scrollToPage = that._filterOptions.page;
        }
        that.$loadMoreButton.attr('data-current-page', scrollToPage);
        that.scrollToPage(that, scrollToPage);
      }
    } else {
      // that.$loadMoreButton.attr('hidden', '');
    }
  }

  scrollToPage(that, scrollToPage) {
    log.debug(logFormat_debug.format('scrollToPage', 'scrollToPage: ', scrollToPage));
    for (let i = 1; i <= scrollToPage; i++) {
      let $divider = $('.uk-divider-page-' + i);
      if ($divider.length > 0) {
        $divider.removeAttr('hidden');
      }
    }
    // let $scrollToElement = $(`.ukg-list-news-item[data-page="page-${scrollToPage}"]`).first();
    let $scrollToElement = $(`.uk-divider-page-${scrollToPage}`).first();
    let $scrollElement = $('#js-scroll-trigger');
    that.updateURL('page', scrollToPage);
    let offset = window.innerHeight / 2;
    let $scroll = UIkit.scroll($scrollElement, {
      offset: offset
    });
    log.debug($scroll);
    $scroll.scrollTo($scrollToElement);
  }

  resetPagination(that) {
    // get all the filtered result by visibility
    let results = $('.ukg-list-news-item[data-page]', that.$el);
    if (results.length > 0) {
      $.each(results, (i, v) => {
        let $item = $(v);
        $item.removeAttr('data-page');
        $item.removeClass('uk-pager-inactive');
      });
    }
    that.updateURL('page');
    that.$loadMoreButton.attr('data-current-page', 0);
    that.$loadMoreButton.attr('data-max-page', 0);
    that._filterOptions = this.processFilterQueries();
    let $dividers = $('.uk-divider-icon', that.$el);
    $dividers.remove();
    // that.$loadMoreButton.removeAttr('hidden');
  }

  toggleNoResultContainer(that) {
    // get all the filtered result by visibility
    log.debug(logFormat_debug.format('toggleNoResultContainer', 'fired: ', ''));
    that.$noResultContainer.removeAttr('hidden');
  }

  toggleAllFilterDropdownOff(that) {
    log.debug(logFormat_debug.format('toggleAllFilterDropdownOff', 'fired: ', ''));
    let $toggleGroup = $('a[data-module="filterToggle"', that.$el);
    log.debug(logFormat_debug.format('toggleAllFilterDropdownOff', 'getting all the toggle group: ', $toggleGroup.length));
    if ($toggleGroup.length > 0) {
      // Found my cousins
      log.debug($toggleGroup);
      $.each($toggleGroup, (i, v) => {
        let $filter = new filterToggle($(v));
        $filter.ToggleOff($(v));
      })
    }
  }

  /**
   * The function to update the current url.
   *
   *
   * @category Functions.
   * @param {String}  key the key for the url to update.
   * @param {String}  value the value for the url to update.
   */
  updateURL(key, value) {
    let stateObject = {
      [key]: value,
    };
    let url = window.location.href;
    url = helper.UpdateUrlParameter(url, key, value);
    window.history.pushState(stateObject, '', url);
  }

  setFilterLabels(options) {
    let labels = [];
    log.debug(logFormat_debug.format('setFilterLabels', 'setFilterLabels starts', 'with options: '));
    log.debug(options);
    Object.keys(options).forEach(key => {
      log.debug(logFormat_debug.format('setFilterLabels', key, options[key]));
      let filterValue = options[key];
      if (filterValue) {
        let $filterLabel = $('<a>', {
          attr: {
            class: 'filterLabel uk-button uk-button-secondary uk-button-small',
            href: '/newsroom',
            // 'uk-filter-control': `filter: [data-${key}]; group: ${key}`
          },
          text: filterValue
        });
        // $filterLabel.attr('uk-filter-control', `filter: [data-${key}]; group: ${key}`);
        log.debug($filterLabel);
        labels.push($filterLabel);
      }
    });
    return labels;
  }

  getFilterTargetByValue(filterGroup, filterValue) {
    let that = this;
    let $filterTarget = false;
    let $filter = $(`.ukg-dropdown-filter #${filterGroup}`, that.$el);
    if ($filter.length > 0 && filterValue) {
      if (filterGroup === 'tag') {
        filterValue = filterValue.replace(/'/g, "&#039;");
      }
      let $filter_target = $filter.find(`ul.uk-dropdown-nav > li > a[data-filter-value="${filterValue}"]`);
      if ($filter_target.length > 0) {
        log.debug(logFormat_debug.format('getFilterTargetByValue', '$filter_target found: ', filterValue));
        log.debug($filter_target);
        $filterTarget = $filter_target;
      }
    } else {
      log.debug(logFormat_debug.format('getFilterTargetByValue', 'filter option does not exist for ', filterValue + ' with value: ' + filterValue));
    }
    return $filterTarget
  }

  loadMore(that) {
    log.debug(logFormat_debug.format('loadMore', 'load more starts', ''));
    let currentPage = parseInt(that.$loadMoreButton.attr('data-current-page'));
    let maxPage = parseInt(that.$loadMoreButton.attr('data-max-page'));
    log.debug(logFormat_debug.format('loadMore', 'current page: ' + currentPage, 'max page: ' + maxPage));
    if (that._loadMore && currentPage < maxPage) {
      log.debug(logFormat_debug.format('loadMore', 'current page', currentPage));
      let nextBatch = currentPage + 1;
      log.debug(logFormat_debug.format('loadMore', 'loading next', nextBatch));
      let $divider = $('.uk-divider-page-' + nextBatch);
      if ($divider.length > 0) {
        $divider.removeAttr('hidden');
      }
      $(`.ukg-list-news-item[data-page="page-${nextBatch}"]`).removeClass('uk-pager-inactive');
      that.$loadMoreButton.attr('data-current-page', nextBatch)
      that.updateURL('page', nextBatch);
    } else {
      // that.$loadMoreButton.attr('hidden', '');
    }
  }

  decode(string) {
    let div = document.createElement("div");
    div.innerHTML = string;
    return typeof div.textContent !== 'undefined' ? div.textContent : div.innerText;
  }
};
