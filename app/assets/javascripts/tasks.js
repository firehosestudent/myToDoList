$(function() {
  // The taskHtml method takes in a JavaScript representation
  // of the task and produces an HTML representation using
  // <li> tags
  function taskHtml(task) {
    var checkedStatus = task.done ? "checked" : "";
    var liClass = task.done ? "completed" : "";
    var liElement = '<li id="listItem-' + task.id + '" class="' + liClass + '"><div class="view"><input class="toggle" type="checkbox" data-id="' + task.id + '"' +
      checkedStatus +
      '><label>' +
       task.title +
       '</label><button class="destroy"></button></div></li>';

    return liElement;
  }

  // toggleTask takes in an HTML representation of the
  // an event that fires from an HTML representation of
  // the toggle checkbox and  performs an API request to toggle
  // the value of the `done` field
  function toggleTask(e) {
    var itemId = $(e.target).data("id");

    var doneValue = Boolean($(e.target).is(':checked'));

    $.post("/tasks/" + itemId, {
      _method: "PUT",
      task: {
        done: doneValue
      }
    }).success( function( data ) {
      var liHtml = taskHtml( data );
      var $li = $("#listItem-" + data.id);
      $li.replaceWith(liHtml);
      $('.toggle').change(toggleTask);
      var liCount = $('.todo-list li').length;
      renderFooter(liCount);
    } );
  }


  // renders footer
  function renderFooter(liCount) {
    // calculate li elements without class .completed (so, active elements)
    var liActive = ($('li').length) - ($('.completed').length);

    // builds a var to store the ENTIRE block of .footer code
    if (liActive === 1) {
      var footerHtmlString = '<footer class="footer"><span id="todo-count"><strong>1</strong> item left</span></footer>';
    } else {
      var footerHtmlString = '<footer class="footer"><span id="todo-count"><strong>' + liActive + '</strong> items left</span></footer>';
    }
    
    // grabs the footer element
    var footerBlock = $('footer');

    // replaces empty footer tags with footerHtmlString code
    // IF there is at least 1 li
    if (liCount > 0) {
      footerBlock.html(footerHtmlString);
    }

  }


  $.get("/tasks").success( function( data ) {
    var htmlString = "";

    $.each(data, function(index,  task) {
      htmlString += taskHtml(task);
    });
    var ulTodos = $('.todo-list');
    ulTodos.html(htmlString);

    var liCount = $('.todo-list li').length;

    renderFooter(liCount);

    $('.toggle').change(toggleTask);

  });


  $('#new-form').submit(function(event) {
    event.preventDefault();
    var textbox = $('.new-todo');
    var payload = {
      task: {
        title: textbox.val()
      }
    };
    $.post("/tasks", payload).success( function( data ) {
      var htmlString = taskHtml(data);
      var ulTodos = $('.todo-list');
      ulTodos.append(htmlString);
      $('.toggle').click(toggleTask);
      $('.new-todo').val('');
      var liCount = $('.todo-list li').length;
      renderFooter(liCount);
    });
  });

  // destroy task
  $('.todo-list').on('click', '.destroy', function() {
    var itemId = $(this).siblings('input').data('id');
    var liId = $(this).closest('li')
    $.ajax({
      url: "/tasks/" + itemId,
      type: 'DELETE',
      success: function(result) {
        // Don't need to do something *with the result*, but need to do something
        liId.remove();
        // counts li elements
        var liCount = $('.todo-list li').length;
        if (liCount === 0) {
          $('.footer').remove();
        } else {
          renderFooter(liCount);
        }
      }
    });
  });

});
